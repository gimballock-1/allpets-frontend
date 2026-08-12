import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

/**
 * Shared MDX renderer (8.8 ↔ 8.11) — the single render path for long-form
 * content bodies (service descriptions, About/Privacy/Terms). Maps MDX output
 * onto the 7.3 tokens so authored prose matches the design system.
 *
 * The `components` map is the whitelist: only these elements get styling, and
 * any custom JSX component an author invents fails the build (MDX throws on
 * unknown components — fail-fast, consistent with the 8.1 loader).
 * h1 renders as h2 — pages own their single h1; authored bodies start at h2.
 */
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-display text-h2 text-ink mt-10 font-bold" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-display text-h2 text-ink mt-10 font-bold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-display text-h3 text-ink mt-8 font-bold" {...props} />
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
  a: ({ href = "", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link
      href={href}
      className="text-brand-strong font-semibold underline underline-offset-2"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-ink font-semibold" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-brand text-ink-muted mt-4 border-l-4 pl-4 italic" {...props} />
  ),
  hr: () => <hr className="border-border mt-8" />,
};

export function RichText({ mdx }: { mdx: string }) {
  return <MDXRemote source={mdx} components={components} />;
}
