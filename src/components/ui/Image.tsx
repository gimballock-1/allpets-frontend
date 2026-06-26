import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { forwardRef } from "react";

/**
 * Default `sizes` for FILL/responsive images — caps the source at the container
 * width so mobile never downloads a desktop-sized image. Fixed width/height
 * images keep Next's native 1x/2x behavior (no `sizes` injected). Override per
 * layout (e.g. a half-width hero or grid cards) for a tighter fit.
 */
const DEFAULT_SIZES = "(min-width: 1280px) 1180px, 100vw";

export type ImageProps = NextImageProps & {
  /** Required, meaningful alt text (a11y — req §8.1). Empty string only for purely decorative images. */
  alt: string;
};

/**
 * Shared image wrapper (7.13). The 7.6 Card/Hero media slots use THIS, not raw
 * next/image. It serves AVIF/WebP + a responsive srcset (next.config `images`),
 * lazy-loads by default, and defaults `sizes` for fill images so we don't
 * over-fetch on mobile.
 *
 * - Above-the-fold LCP image (the home hero): pass `preload` (eager, not lazy).
 * - CLS: pass `fill` + a positioned/aspect container, or `width`/`height`, so the
 *   image reserves space (req §8.3, CLS < 0.1).
 * - Static-imported `public/` assets get `placeholder="blur"` for free.
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { sizes, fill, ...props },
  ref,
) {
  // Only default `sizes` for fill/responsive images — injecting it on a
  // fixed-size image would switch it to the responsive `w` srcset and over-fetch.
  return (
    <NextImage
      ref={ref}
      fill={fill}
      sizes={sizes ?? (fill ? DEFAULT_SIZES : undefined)}
      {...props}
    />
  );
});
