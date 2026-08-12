"use client";

import { useEffect } from "react";
import "./globals.css";
import { fontVariables } from "./fonts";
import { ACTIVE_THEME } from "@/lib/theme";

/**
 * Root-layout error boundary (8.12) — only reached when the root layout itself
 * throws, so it must render its own <html>/<body> and can't reuse the layout's
 * header/footer (they're part of what failed). Kept deliberately minimal:
 * globals.css + theme attribute for tokens, no component imports beyond fonts,
 * no internals leaked.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // TODO(2.10): capture via the GlitchTip client once it's initialized.
    console.error(error);
  }, [error]);

  return (
    <html lang="en" data-theme={ACTIVE_THEME} className={fontVariables}>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="font-display text-h1 text-ink font-bold">
            We hit an unexpected snag
          </h1>
          <p className="text-body text-ink-muted mt-4 max-w-xl">
            Sorry about that — the page failed to load. Trying again usually fixes it.
          </p>
          {/* The root layout itself failed — a boundary reset would re-render
              the same broken tree; a full document reload is the honest retry. */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-brand text-on-brand rounded-pill hover:bg-brand-hover mt-8 px-6 py-3 font-semibold shadow-md"
          >
            Try again
          </button>
          {error.digest ? (
            <p className="text-small text-ink-subtle mt-8">Reference code: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
