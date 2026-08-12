"use client";

import { useEffect } from "react";
import { Button, Container } from "@/components/ui";

/**
 * Branded 500 for route-segment runtime errors (8.12) — App Router error
 * boundaries must be Client Components. Sits INSIDE the root layout, so
 * header/footer navigation survives the failure. Shows no stack trace or
 * error message (internals must not leak, req §8.6) — only the digest, an
 * opaque correlation code that's safe to surface and useful in a bug report.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(2.10): capture via the GlitchTip client once it's initialized.
    // Until then the console keeps the error visible in dev/support sessions.
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <p className="font-accent text-brand-strong text-small font-bold uppercase tracking-label">
        Something went wrong
      </p>
      <h1 className="font-display text-h1 text-ink mt-3 font-bold">
        We hit an unexpected snag
      </h1>
      <p className="text-body text-ink-muted mx-auto mt-4 max-w-xl">
        Sorry about that — it&rsquo;s not you, it&rsquo;s us. Trying again usually fixes it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>
      {error.digest ? (
        <p className="text-small text-ink-subtle mt-8">Reference code: {error.digest}</p>
      ) : null}
    </Container>
  );
}
