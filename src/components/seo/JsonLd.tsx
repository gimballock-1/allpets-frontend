import { serializeJsonLd } from "@/lib/structured-data";

/**
 * The one way a JSON-LD block reaches a page (12.4) — owns the script tag and
 * the `<`-escape wiring (#42 XSS guard), so every future block goes through the
 * escaped path instead of a hand-rolled `dangerouslySetInnerHTML`.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
