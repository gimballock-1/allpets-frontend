import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ExternalLink } from "@/components/ui";

/**
 * Shared MDX renderer (8.8 ↔ 8.11) — the single render path for long-form
 * content bodies (service descriptions, About/Privacy/Terms), mapping markdown
 * output onto the 7.3 tokens so authored prose matches the design system.
 *
 * Fail-fast boundary (matching the 8.1 loader): custom JSX components throw at
 * build (MDX rejects anything unmapped), and so do authored body images and
 * empty links below — images belong in the frontmatter `image` field (7.13).
 * Every element plain markdown syntax can emit has a mapping here; h1 renders
 * as h2 because pages own their single h1 — authored bodies start at h2.
 */

const LINK_CLASS = "text-brand-strong font-semibold underline underline-offset-2";

const HeadingH2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="font-display text-h2 text-ink mt-10 font-bold" {...props} />
);

const components = {
  h1: HeadingH2,
  h2: HeadingH2,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-display text-h3 text-ink mt-8 font-bold" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-body text-ink mt-6 font-bold" {...props} />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5 className="text-small text-ink mt-4 font-bold" {...props} />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 className="text-small text-ink-muted mt-4 font-bold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-body text-ink-muted mt-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-body text-ink-muted mt-4 flex list-disc flex-col gap-2 pl-6" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-body text-ink-muted mt-4 flex list-decimal flex-col gap-2 pl-6" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} />,
  a: ({ href = "", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) {
      // Malformed `[text]()` would silently self-link — stop the build instead.
      throw new Error("RichText: MDX link with an empty href — give the link a target.");
    }
    if (href.startsWith("/") || href.startsWith("#")) {
      return <Link href={href} className={LINK_CLASS} {...props} />;
    }
    if (href.startsWith("http")) {
      // Same behavior, same identification (12.10/F3, WCAG 3.2.4): authored
      // external links announce "(opens in new tab)" like every other new-tab
      // link on the site — the shared ExternalLink is the single source.
      return <ExternalLink href={href} className={LINK_CLASS} {...props} />;
    }
    // mailto / tel — plain same-tab anchor, no client nav.
    return <a href={href} className={LINK_CLASS} {...props} />;
  },
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-ink font-semibold" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-surface-2 text-ink rounded px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-surface-2 border-border rounded-card text-small mt-4 overflow-x-auto border p-4" {...props} />
  ),
  img: (): never => {
    throw new Error(
      "RichText: images in MDX bodies are not supported — use the frontmatter `image` field (7.13 pipeline).",
    );
  },
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-brand text-ink-muted mt-4 border-l-4 pl-4 italic" {...props} />
  ),
  hr: () => <hr className="border-border mt-8" />,
};

// Card-embedded bodies (team bios) sit under an existing heading (the member
// name), so an authored heading would break the document outline — fail the
// build instead (WCAG 1.3.1), same contract as body images above.
const rejectHeading = (): never => {
  throw new Error(
    "RichText: headings are not allowed in this body — it renders inside a card that already has a heading.",
  );
};
const noHeadingComponents = {
  ...components,
  h1: rejectHeading,
  h2: rejectHeading,
  h3: rejectHeading,
  h4: rejectHeading,
  h5: rejectHeading,
  h6: rejectHeading,
};

export function RichText({
  mdx,
  noHeadings = false,
}: {
  mdx: string;
  /** For card-embedded bodies (e.g. team bios): authored headings fail the build. */
  noHeadings?: boolean;
}) {
  return (
    <MDXRemote
      source={mdx}
      components={noHeadings ? noHeadingComponents : components}
    />
  );
}
