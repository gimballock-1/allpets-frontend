/**
 * Automated WCAG 2.1 A/AA audit — axe-core against the built site (12.6,
 * issue #44, req §8.1).
 *
 * Boots the standalone build artifact (the EXACT thing the Docker image ships,
 * same pattern as ci.yml's runtime smoke test), runs `@axe-core/cli` over every
 * public route, and exits non-zero on ANY violation of the WCAG 2.0/2.1 A+AA
 * rule set — so CI goes red the moment a regression lands. Automated axe
 * catches only ~30–50% of WCAG issues; this is a regression gate, not a
 * substitute for the manual audit (12.7). Run after a production build:
 *
 *   pnpm build && pnpm a11y
 *
 * Chromedriver: the npm `chromedriver` package's postinstall (an unpinned
 * binary download) is deliberately skipped in pnpm-workspace.yaml, so the
 * driver comes from the machine instead, resolved in this order:
 *   1. $CHROMEDRIVER                  — explicit path to an executable
 *   2. $CHROMEWEBDRIVER/chromedriver  — GitHub ubuntu runners preinstall a
 *                                       Chrome-matched driver and export this
 *   3. `chromedriver` on PATH         — e.g. `brew install --cask chromedriver`
 *   4. Selenium Manager (bundled inside selenium-webdriver) — downloads a
 *      driver matching the installed Chrome into ~/.cache/selenium. The
 *      local-dev fallback; needs network on first run. DISABLED under CI
 *      (fail closed): it fetches an unpinned binary at job time, and runners
 *      are expected to provide the driver themselves.
 */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const serverJs = path.join(standaloneDir, "server.js");

// Every public route (issue #44): the static pages plus EVERY service detail
// page, enumerated from content/services/*.mdx (the same source of truth
// generateStaticParams uses) so new services are covered automatically.
// /book doesn't exist yet (Cal.com embed, Epic 9) — add it (with the
// cross-origin iframe excluded) when it lands. /styleguide is a dev design
// reference, not part of the public sitemap.
const serviceRoutes = fs
  .readdirSync(path.join(root, "content", "services"))
  .filter((f) => f.endsWith(".mdx"))
  .sort()
  .map((f) => `/services/${f.replace(/\.mdx$/, "")}`);
if (serviceRoutes.length === 0) {
  console.error(
    "a11y-scan: no content/services/*.mdx found — service-route enumeration is broken.",
  );
  process.exit(1);
}
const ROUTES = ["/", "/services", ...serviceRoutes, "/about", "/contact", "/privacy", "/terms"];
// An empty route list would scan nothing and vacuously "pass" — never allow it.
if (ROUTES.length === 0) {
  console.error("a11y-scan: route list is empty — refusing to report a vacuous pass.");
  process.exit(1);
}

// WCAG 2.0 + 2.1, levels A + AA (req §8.1). No rule suppressions — if one ever
// becomes unavoidable (e.g. a third-party embed), add `--disable <rule-id>`
// HERE with a comment linking the tracking issue; never blanket-disable.
const TAGS = "wcag2a,wcag2aa,wcag21a,wcag21aa";

const HOST = "127.0.0.1";
const PORT = Number(process.env.A11Y_PORT ?? 4600);

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

/** Resolve a chromedriver executable per the order documented above. */
function resolveChromedriver() {
  const explicit = process.env.CHROMEDRIVER;
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      console.error(`a11y-scan: $CHROMEDRIVER points at ${explicit}, which does not exist.`);
      process.exit(1);
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
  if (process.env.CI) {
    console.error(
      "a11y-scan: no chromedriver found ($CHROMEDRIVER / $CHROMEWEBDRIVER / PATH); " +
        "refusing the Selenium Manager download fallback under CI (unpinned network fetch).",
    );
    process.exit(1);
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
    console.error(
      "a11y-scan: no chromedriver found ($CHROMEDRIVER / $CHROMEWEBDRIVER / PATH) " +
        `and Selenium Manager failed: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }
}

const { driver, source } = resolveChromedriver();
console.log(`a11y-scan: chromedriver ${driver} (via ${source})`);

const base = `http://${HOST}:${PORT}`;

// Refuse to scan a stranger: if something already listens on the port, our
// spawned server dies EADDRINUSE while the health poll (and axe) happily talk
// to the pre-existing process — auditing who-knows-which build. Bail out
// BEFORE spawning if anything answers.
try {
  await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1500) });
  console.error(
    `a11y-scan: something is already listening on ${base} — refusing to scan ` +
      "an unknown server. Stop it or set A11Y_PORT to a free port.",
  );
  process.exit(1);
} catch {
  /* connection refused — port is free */
}

// Boot the standalone server, same env contract as ci.yml's smoke test.
const serverLog = [];
const server = spawn(process.execPath, ["server.js"], {
  cwd: standaloneDir,
  env: { ...process.env, PORT: String(PORT), HOSTNAME: HOST, NODE_ENV: "production" },
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

let healthy = false;
for (let i = 0; i < 20 && !serverExited; i++) {
  try {
    const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(2000) });
    if (res.status === 200) {
      healthy = true;
      break;
    }
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 1000));
}
// A dead child means any answer came from some OTHER process — never scan it.
if (!healthy || serverExited) {
  console.error(
    serverExited
      ? "a11y-scan: standalone server exited before becoming healthy (port clash? boot crash?)"
      : "a11y-scan: standalone server failed to serve /api/health within 20s",
  );
  console.error(Buffer.concat(serverLog).toString());
  process.exit(1);
}

// Preflight every route: axe treats a 404/500 like any other document, so a
// missing or crashing page would "pass" its scan. Demand HTTP 200 from each
// route before auditing anything.
for (const route of ROUTES) {
  let status;
  try {
    const res = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(10000) });
    status = res.status;
  } catch (err) {
    console.error(
      `a11y-scan: preflight fetch of ${route} failed: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }
  if (status !== 200) {
    console.error(
      `a11y-scan: ${route} returned HTTP ${status} (expected 200) — refusing to ` +
        "axe-scan a missing/broken page as if it were fine.",
    );
    process.exit(1);
  }
}
console.log(`a11y-scan: preflight OK — ${ROUTES.length} routes all HTTP 200`);

// One axe invocation scans every URL in sequence and, with --exit, returns 1
// if any page has violations. no-sandbox/disable-dev-shm-usage keep headless
// Chrome dependable on CI runners; the CLI is headless by default.
const axeBin = path.join(root, "node_modules", ".bin", "axe");
const axe = spawnSync(
  axeBin,
  [
    ...ROUTES.map((r) => `${base}${r}`),
    "--tags",
    TAGS,
    "--chromedriver-path",
    driver,
    "--chrome-options",
    "no-sandbox,disable-dev-shm-usage",
    "--exit",
  ],
  { stdio: "inherit" },
);

stopServer();
process.exit(axe.status ?? 1);
