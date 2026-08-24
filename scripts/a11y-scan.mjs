/**
 * Automated WCAG 2.1 A/AA audit — axe-core against the built site (12.6,
 * issue #44, req §8.1).
 *
 * Boots the standalone build artifact (the EXACT thing the Docker image
 * ships), preflights every route, then runs `@axe-core/cli` over each and
 * fails on ANY violation of the WCAG 2.0/2.1 A+AA rule set — so CI goes red
 * the moment a regression lands. Automated axe catches only ~30–50% of WCAG
 * issues; this is a regression gate, not a substitute for the manual audit
 * (12.7). Run after a production build:
 *
 *   pnpm build && pnpm a11y            # full audit
 *   pnpm build && pnpm a11y --smoke    # boot + health + route preflight only
 *                                      # (ci.yml's standalone smoke test)
 *
 * Routes are derived from the build's own prerender-manifest.json (minus
 * non-page entries), so new pages are scanned automatically and a page the
 * build didn't actually emit can never green-wash the audit.
 *
 * Chromedriver: the npm `chromedriver` package's postinstall (an unpinned
 * binary download) is deliberately skipped in pnpm-workspace.yaml, so the
 * driver comes from the machine instead, resolved in this order:
 *   1. $CHROMEDRIVER                  — explicit path to an executable
 *                                       (ci.yml pins $CHROMEWEBDRIVER/chromedriver)
 *   2. $CHROMEWEBDRIVER/chromedriver  — GitHub ubuntu runners preinstall a
 *                                       Chrome-matched driver and export this
 *   3. `chromedriver` on PATH         — e.g. `brew install --cask chromedriver`
 *   4. Selenium Manager (bundled inside selenium-webdriver) — downloads a
 *      driver matching the installed Chrome into ~/.cache/selenium. The
 *      local-dev fallback; needs network on first run. DISABLED under CI
 *      (fail closed): it fetches an unpinned binary at job time, and runners
 *      are expected to provide the driver themselves.
 * Known local-only override surface: @axe-core/cli itself also honors the
 * CHROME_TEST_PATH / CHROMEDRIVER_TEST_PATH env vars (the pair
 * browser-driver-manager writes to ~/.browser-driver-manager/.env for users
 * who source it). Left unpinned on purpose — CI runners have neither, and a
 * local dev who set them up did so deliberately.
 */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const smokeOnly = process.argv.includes("--smoke");

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const serverJs = path.join(standaloneDir, "server.js");

const HOST = "127.0.0.1";
const PORT = Number(process.env.A11Y_PORT ?? 4600);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(
    `a11y-scan: A11Y_PORT must be an integer in 1..65535 (got ${JSON.stringify(process.env.A11Y_PORT)}).`,
  );
  process.exit(1);
}

// WCAG 2.0 + 2.1, levels A + AA (req §8.1). No rule suppressions — if one ever
// becomes unavoidable (e.g. a third-party embed), add `--disable <rule-id>`
// HERE with a comment linking the tracking issue; never blanket-disable.
const TAGS = "wcag2a,wcag2aa,wcag21a,wcag21aa";

if (!fs.existsSync(serverJs)) {
  console.error(
    "a11y-scan: .next/standalone/server.js not found — run `pnpm build` first.",
  );
  process.exit(1);
}

// The standalone tracer emits server code only; static chunks and public/
// assets are copied in next to it (exactly what deploy/Dockerfile does).
// Without them pages render unstyled and color-contrast results are garbage.
fs.cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
  force: true,
});
fs.cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), {
  recursive: true,
  force: true,
});

// ---------------------------------------------------------------------------
// Routes: derived from the build's prerender manifest — the build's OWN
// statement of which HTML routes exist. Hand-kept or content-derived lists
// drift three ways: a page filtered out of generateStaticParams (e.g. a
// deactivated service) 404s under a filename-derived list, a frontmatter slug
// that differs from its filename loses coverage, and brand-new pages go
// silently unscanned. NOTE: every page today is static/SSG; a future
// force-dynamic PAGE would not appear here and would need explicit handling.
// ---------------------------------------------------------------------------
const manifest = JSON.parse(
  fs.readFileSync(path.join(standaloneDir, ".next", "prerender-manifest.json"), "utf8"),
);
// Non-page entries only: metadata assets carry file extensions (/icon.png,
// /favicon.ico, /manifest.webmanifest); /_not-found and /_global-error are
// Next-internal templates. The REAL 404 UI (not-found.tsx) is user-facing and
// is audited below through a route that cannot exist.
const EXCLUDED_INTERNALS = new Set(["/_not-found", "/_global-error"]);
// The 12.5 OG card is a dynamic file-convention route, so it is EXTENSIONLESS
// yet serves a PNG — an asset for the smoke contract, never an axe target.
// Hardcoded on purpose, mirroring the hardcoded og:image re-reference in
// src/lib/seo.ts's pageMetadata(): if the file ever moves (e.g. under a route
// group, where Next hash-suffixes the route), this exact path 404s in the
// preflight below and CI fails loudly — instead of every page silently
// shipping a dead og:image URL to crawlers.
const METADATA_IMAGE_ROUTES = ["/opengraph-image"];
const isAssetRoute = (route) =>
  /\.[a-z0-9]+$/i.test(route) || METADATA_IMAGE_ROUTES.includes(route);
const pageRoutes = Object.keys(manifest.routes)
  .filter((route) => !EXCLUDED_INTERNALS.has(route) && !isAssetRoute(route))
  .sort();
// Build-emitted NON-HTML routes (the 12.2/12.3 metadata files sitemap.xml and
// robots.txt, icons/webmanifest, the 12.5 OG image). Not axe-scannable, but the
// smoke contract requires each to serve 200 with a non-empty body — this
// replaces the sitemap/robots curl checks the old hand-rolled ci.yml smoke step
// had. METADATA_IMAGE_ROUTES are unioned in, NOT trusted to the manifest scan:
// a renamed route would vanish from the manifest and dodge its own preflight.
const assetRoutes = [
  ...new Set([
    ...Object.keys(manifest.routes).filter(
      (route) => !EXCLUDED_INTERNALS.has(route) && isAssetRoute(route),
    ),
    ...METADATA_IMAGE_ROUTES,
  ]),
].sort();
if (pageRoutes.length === 0) {
  console.error(
    "a11y-scan: derived no page routes from prerender-manifest.json — derivation is broken; refusing a vacuous pass.",
  );
  process.exit(1);
}
const ROUTES = [
  ...pageRoutes.map((p) => ({ path: p, expectStatus: 200 })),
  // The 404 template is reachable only via a miss; scan it too.
  { path: "/this-page-does-not-exist", expectStatus: 404 },
];

// ---------------------------------------------------------------------------
// Server env: the production SHAPE. .env.example is the documented home of the
// public values (the CI build step sources the same file). API_BASE is then
// stubbed to a dead local port (9 — nothing listens; refusals are instant) so
// the audited server NEVER calls the live prod API from CI. It must stay SET,
// not dropped: post-#90 the Home reviews section only renders when API_BASE
// exists, so an unset var would silently remove that section from the audited
// page forever and axe would never see it.
// GIT_SHA doubles as a per-run nonce: /api/health is force-dynamic and echoes
// it at request time, proving every answer comes from OUR child process and
// not some stale server that happened to own the port first.
// ---------------------------------------------------------------------------
const envExample = {};
for (const line of fs.readFileSync(path.join(root, ".env.example"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
  if (m) envExample[m[1]] = m[2];
}
const nonce = crypto.randomUUID();

const serverLog = [];
/** Print a failure, dump the captured server log (if any), exit 1. */
function fail(msg) {
  console.error(`a11y-scan: ${msg}`);
  if (serverLog.length > 0) {
    console.error("--- standalone server log ---");
    console.error(Buffer.concat(serverLog).toString());
  }
  process.exit(1);
}

const base = `http://${HOST}:${PORT}`;

// Refuse to scan a stranger: if something already listens on the port, our
// spawned server dies EADDRINUSE while the health poll (and axe) happily talk
// to the pre-existing process — auditing who-knows-which build. Bail out
// BEFORE spawning if anything answers.
try {
  await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1500) });
  fail(
    `something is already listening on ${base} — refusing to scan an unknown server. ` +
      "Stop it or set A11Y_PORT to a free port.",
  );
} catch {
  /* connection refused — port is free */
}

// Boot the standalone server (same artifact the Docker image runs).
const server = spawn(process.execPath, ["server.js"], {
  cwd: standaloneDir,
  env: {
    ...process.env,
    ...envExample,
    API_BASE: "http://127.0.0.1:9", // stub — see env-contract comment above
    GIT_SHA: nonce, // per-run sentinel echoed by /api/health
    PORT: String(PORT),
    HOSTNAME: HOST,
    NODE_ENV: "production",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (d) => serverLog.push(d));
server.stderr.on("data", (d) => serverLog.push(d));
let serverExited = false;
server.on("exit", () => {
  serverExited = true;
});

function stopServer() {
  if (server.exitCode === null) server.kill("SIGTERM");
}
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));
process.on("SIGHUP", () => process.exit(129));

/** Fetch /api/health; returns true only for HTTP 200 carrying OUR nonce. */
async function healthAnsweredByOurServer(context) {
  const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(2000) });
  if (res.status !== 200) return false;
  const body = await res.json();
  if (body.gitSha !== nonce) {
    // 200 from the right port but the wrong process — never keep going.
    fail(
      `/api/health answered ${context} WITHOUT this run's nonce — another server ` +
        "is squatting on the port; refusing to scan it.",
    );
  }
  return true;
}

// Readiness: up to 20 polls × (≤2s fetch timeout + 1s sleep) ≈ 60s worst case.
let healthy = false;
for (let i = 0; i < 20 && !serverExited; i++) {
  try {
    if (await healthAnsweredByOurServer("during boot")) {
      healthy = true;
      break;
    }
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 1000));
}
// A dead child means any answer came from some OTHER process — never scan it.
if (serverExited) {
  fail("standalone server exited before becoming healthy (port clash? boot crash?)");
}
if (!healthy) {
  fail("standalone server failed to serve /api/health within ~60s");
}

// Preflight every route: axe treats a 404/500 like any other document, so a
// missing or crashing page would "pass" its scan. Demand the EXACT expected
// status — redirect: "manual" so a 3xx (e.g. a stray trailing-slash redirect)
// fails loudly instead of being followed into a "200".
for (const { path: route, expectStatus } of ROUTES) {
  let status;
  try {
    const res = await fetch(`${base}${route}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    status = res.status;
  } catch (err) {
    fail(`preflight fetch of ${route} failed: ${err instanceof Error ? err.message : err}`);
  }
  if (status !== expectStatus) {
    fail(
      `${route} returned HTTP ${status} (expected ${expectStatus}) — refusing to ` +
        "axe-scan a missing/broken page as if it were fine.",
    );
  }
}
// Metadata/asset routes: 200 and a non-empty body (an empty sitemap.xml or
// robots.txt served "successfully" is still a broken deploy — 12.2/12.3).
for (const route of assetRoutes) {
  let status;
  let bytes = 0;
  try {
    const res = await fetch(`${base}${route}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    status = res.status;
    bytes = (await res.arrayBuffer()).byteLength;
  } catch (err) {
    fail(`preflight fetch of ${route} failed: ${err instanceof Error ? err.message : err}`);
  }
  if (status !== 200) {
    fail(`${route} returned HTTP ${status} (expected 200).`);
  }
  if (bytes === 0) {
    fail(`${route} served an empty body — the build emitted a broken metadata file.`);
  }
}
// Re-verify the sentinel AFTER preflight: the child must still be alive and
// still the process answering — closes the boot/scan race entirely.
if (serverExited) fail("standalone server exited during route preflight");
try {
  if (!(await healthAnsweredByOurServer("after preflight"))) {
    fail("/api/health stopped answering after route preflight");
  }
} catch (err) {
  fail(`post-preflight health recheck failed: ${err instanceof Error ? err.message : err}`);
}
console.log(
  `a11y-scan: preflight OK — ${ROUTES.length} page routes + ${assetRoutes.length} metadata/asset routes served their expected status`,
);

// Smoke mode stops here: boot + health(nonce) + every-route preflight is the
// standalone runtime smoke test (ci.yml runs `pnpm a11y --smoke` as its own
// step so a boot failure and an a11y failure stay separately diagnosable).
if (smokeOnly) {
  console.log("a11y-scan: smoke OK — standalone runtime boots and serves every route");
  stopServer();
  process.exit(0);
}

/** Resolve a chromedriver executable per the order documented in the header. */
function resolveChromedriver() {
  const inCI = process.env.CI === "true" || process.env.CI === "1";

  const explicit = process.env.CHROMEDRIVER;
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      fail(`$CHROMEDRIVER points at ${explicit}, which does not exist.`);
    }
    return { driver: explicit, source: "$CHROMEDRIVER" };
  }

  const runnerDir = process.env.CHROMEWEBDRIVER; // directory, per GH runner images
  if (runnerDir) {
    const candidate = path.join(runnerDir, "chromedriver");
    if (fs.existsSync(candidate)) {
      return { driver: candidate, source: "$CHROMEWEBDRIVER" };
    }
  }

  const onPath = spawnSync("which", ["chromedriver"], { encoding: "utf8" });
  if (onPath.status === 0 && onPath.stdout.trim()) {
    return { driver: onPath.stdout.trim(), source: "PATH" };
  }

  // In CI, fail closed rather than fall through to Selenium Manager — that
  // path downloads an UNPINNED chromedriver from the network at job time.
  // Runners must provide the driver (GitHub's ubuntu images export
  // $CHROMEWEBDRIVER and put one on PATH); the managed download is a
  // local-dev convenience only.
  if (inCI) {
    fail(
      "no chromedriver found ($CHROMEDRIVER / $CHROMEWEBDRIVER / PATH); " +
        "refusing the Selenium Manager download fallback under CI (unpinned network fetch).",
    );
  }

  // Selenium Manager ships inside selenium-webdriver (a transitive of
  // @axe-core/cli — not hoisted, so resolve it through the CLI's own tree).
  const require_ = createRequire(import.meta.url);
  const cliRequire = createRequire(require_.resolve("@axe-core/cli/package.json"));
  const swDir = path.dirname(cliRequire.resolve("selenium-webdriver/package.json"));
  const platform =
    process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux";
  const manager = path.join(
    swDir,
    "bin",
    platform,
    platform === "windows" ? "selenium-manager.exe" : "selenium-manager",
  );
  try {
    const out = JSON.parse(
      execFileSync(manager, ["--driver", "chromedriver", "--output", "json"], {
        encoding: "utf8",
      }),
    );
    return { driver: out.result.driver_path, source: "selenium-manager" };
  } catch (err) {
    fail(
      "no chromedriver found ($CHROMEDRIVER / $CHROMEWEBDRIVER / PATH) " +
        `and Selenium Manager failed: ${err instanceof Error ? err.message : err}`,
    );
  }
}

const { driver, source } = resolveChromedriver();
console.log(`a11y-scan: chromedriver ${driver} (via ${source})`);

// One axe invocation scans every URL in the same headless-Chrome session.
// --stdout gives machine-readable JSON: the verdict below comes from PARSING
// the results — one result per route, zero violations — never from trusting
// the CLI's bare exit code (which an ambient NODE_OPTIONS like
// --unhandled-rejections=warn could otherwise launder into a false green, so
// NODE_OPTIONS is stripped from the child too). no-sandbox/
// disable-dev-shm-usage keep headless Chrome dependable on CI runners.
const axeBin = path.join(root, "node_modules", ".bin", "axe");
const axeEnv = { ...process.env };
delete axeEnv.NODE_OPTIONS;
const axe = spawnSync(
  axeBin,
  [
    ...ROUTES.map((r) => `${base}${r.path}`),
    "--tags",
    TAGS,
    "--chromedriver-path",
    driver,
    "--chrome-options",
    "no-sandbox,disable-dev-shm-usage",
    "--stdout",
    "--exit",
  ],
  {
    env: axeEnv,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  },
);
stopServer();

// A spawn-level error (bad path, EACCES…) means NOTHING was scanned — the
// worst kind of red to diagnose without the underlying error printed.
if (axe.error) {
  fail(`failed to launch the axe CLI: ${axe.error.message}`);
}

let results;
try {
  results = JSON.parse(axe.stdout);
} catch {
  console.error(axe.stdout);
  fail(`axe CLI emitted unparseable output (exit code ${axe.status}) — raw output above.`);
}
if (!Array.isArray(results)) results = [results];

// Every route must have produced a result — a crashed/skipped page must never
// pass by omission.
const scannedUrls = new Set(results.map((r) => r.url));
for (const { path: route } of ROUTES) {
  if (!scannedUrls.has(`${base}${route}`)) {
    fail(`axe returned no result for ${route} — refusing a partial pass (exit code ${axe.status}).`);
  }
}
if (results.length !== ROUTES.length) {
  fail(`axe returned ${results.length} results for ${ROUTES.length} routes (exit code ${axe.status}).`);
}

let violationTotal = 0;
for (const result of results) {
  const violations = result.violations ?? [];
  console.log(`${violations.length === 0 ? "PASS" : "FAIL"} ${result.url} — ${violations.length} violation(s)`);
  for (const v of violations) {
    violationTotal += 1;
    console.error(`  [${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})`);
    for (const node of v.nodes ?? []) {
      console.error(`    at ${(node.target ?? []).join(" ")}`);
    }
  }
}
console.log(`a11y-scan: ${results.length} pages scanned, ${violationTotal} violation(s)`);

if (violationTotal > 0) {
  console.error("a11y-scan: WCAG 2.1 A/AA violations found — failing (issue #44).");
  process.exit(1);
}
// Zero parsed violations but a non-zero CLI exit still means something went
// wrong (e.g. a page errored inside axe) — stay red rather than guess green.
if (axe.status !== 0) {
  fail(`axe CLI exited ${axe.status} despite zero parsed violations — refusing to pass.`);
}
process.exit(0);
