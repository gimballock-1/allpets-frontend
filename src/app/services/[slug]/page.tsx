import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Container, IconBox, Image, SectionHeading } from "@/components/ui";
import { BookServiceCTA } from "@/components/services/BookServiceCTA";
import { serviceIcon } from "@/components/services/serviceIcons";
import { RichText } from "@/components/RichText";
import { getServiceBySlug, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/**
 * Service detail "/services/{slug}" (8.8) — statically generated for every
 * active service (generateStaticParams over the 8.1 loader); unknown or
 * inactive slugs 404 (dynamicParams=false + the notFound guard). Long
 * description renders through the shared RichText MDX pipeline (8.8 ↔ 8.11);
 * the booking CTA is the 9.3 slot component, no link-building here.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return pageMetadata({
    // Authored service metaTitles do NOT name the clinic (unlike page seo
    // blocks), so both branches take the root title.template suffix.
    title: service.seo?.metaTitle ?? service.title,
    description: service.seo?.metaDescription ?? service.shortDescription,
    // service.slug (not the URL param) — the content module's slug is the one
    // the canonical must match (↔ sitemap, 12.2); identical under
    // dynamicParams=false, but the content slug is the contract.
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <Container className="py-16">
      <Link
        href="/services"
        className="text-brand-strong text-small font-semibold hover:underline"
      >
        <span aria-hidden="true">←</span> All services
      </Link>

      <div className="mt-6 flex items-start gap-5">
        <IconBox className="hidden h-14 w-14 shrink-0 sm:inline-flex">
          {serviceIcon(service.icon)}
        </IconBox>
        <SectionHeading
          as="h1"
          size="h1"
          title={service.title}
          subtitle={service.shortDescription}
        />
      </div>

      {service.image ? (
        <div className="rounded-card relative mt-10 aspect-[21/9] overflow-hidden">
          <Image
            src={service.image}
            alt={service.title}
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article>
          <RichText mdx={service.body} />
        </article>

        <aside>
          <Card className="lg:sticky lg:top-24">
            {service.whatsIncluded.length > 0 ? (
              <>
                <h2 className="font-display text-h3 text-ink font-bold">
                  What&rsquo;s included
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {/* Index keys — the schema permits duplicate bullet strings,
                      and the list is static (never reordered). */}
                  {service.whatsIncluded.map((item, i) => (
                    <li key={i} className="text-body text-ink-muted flex gap-3">
                      <span aria-hidden="true" className="text-brand-strong font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <dl className="border-border mt-6 flex flex-col gap-2 border-t pt-4">
              <div className="flex justify-between gap-4">
                <dt className="text-small text-ink-muted">Typical duration</dt>
                <dd className="text-small text-ink font-semibold">
                  ~{service.typicalDurationMin} min
                </dd>
              </div>
              {service.price ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-small text-ink-muted">Price</dt>
                  <dd className="text-small text-ink font-semibold">{service.price}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6">
              <BookServiceCTA service={service} />
            </div>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
