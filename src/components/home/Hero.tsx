import { Button, Container, Hero as HeroBlock, Image } from "@/components/ui";
import { getActivePromotions, getSite } from "@/lib/content";
import heroImage from "@public/images/hero-placeholder.png";

/**
 * Home hero (8.2) — content-driven headline/subcopy/alt from SiteSetting, the primary
 * "Book a Visit" CTA → /book (the embed itself is 9.1; header CTA is 9.2), and an
 * optional Home-placed promotion banner (nothing renders when none is active).
 *
 * The hero image is a static-imported local asset (7.7/7.13) so next/image gets
 * intrinsic dimensions + a free blur placeholder; `priority` makes it the eager LCP
 * element (req §8.3). Headline is real DOM text (SEO/a11y), never baked into the image.
 */
export function Hero() {
  const { hero, address } = getSite();
  const [promo] = getActivePromotions("home");

  return (
    <Container>
      {promo ? (
        <div className="bg-panel rounded-card mt-6 flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <p className="text-ink text-small font-semibold">{promo.title}</p>
          {promo.ctaLabel && promo.ctaHref ? (
            <Button variant="ghost" size="sm" href={promo.ctaHref}>
              {promo.ctaLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      <HeroBlock
        eyebrow={`${address.city}, ${address.state}`}
        title={hero.headline}
        subtitle={hero.subcopy}
        primaryCta={{ label: "Book a Visit", href: "/book" }}
        secondaryCta={{ label: "Explore services", href: "/services" }}
        media={
          <Image
            src={heroImage}
            alt={hero.imageAlt}
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        }
      />
    </Container>
  );
}
