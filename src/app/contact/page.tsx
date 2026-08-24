import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, PhoneLink, SectionHeading } from "@/components/ui";
import { BOOK_HREF } from "@/components/layout/nav";
import { ContactForm } from "@/components/contact/ContactForm";
import { StaticMap } from "@/components/contact/StaticMap";
import { VeterinaryCareJsonLd } from "@/components/seo/VeterinaryCareJsonLd";
import { getSite } from "@/lib/content";
import { groupHours } from "@/lib/hours";
import { addressLine, googleMapsUrl } from "@/lib/maps";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit, call, or message All Pets Veterinary Hospital in Norman, Oklahoma — address, opening hours, after-hours emergency info, and a contact form.",
};

const H2_CLASS = "font-display text-h3 text-ink font-bold";

/**
 * Contact "/contact" (8.10) — Server Component: everything is content-driven
 * via the 8.1 `getSite()` (NAP, per-day hours, emergency copy) except the one
 * client island, `ContactForm`. The map is committed static OSM tiles linking
 * out to Google Maps (req §6.3 — no Maps SDK, no key). The form is for general
 * inquiries only; booking stays with Cal.com (Epic 9).
 */
export default function ContactPage() {
  const site = getSite();
  const address = addressLine(site.address);
  const mapsHref = googleMapsUrl(site);
  const hours = groupHours(site.hours);
  // Display-form referral number → bare digits for a dialable tel: href.
  // (The confirmed emergency referral — incl. a proper E.164 — lands in 18.6.)
  const referralTel = site.emergency.referralPhone?.replace(/\D/g, "");

  return (
    <Container className="py-16">
      <VeterinaryCareJsonLd />
      <SectionHeading
        as="h1"
        size="h1"
        eyebrow="Contact"
        title="Get in touch"
        subtitle="Questions about your pet's care, records requests, or anything else — send us a note, give us a call, or come see us."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-10">
          <section aria-label="Location and contact details">
            <h2 className={H2_CLASS}>Visit us</h2>
            <address className="text-body text-ink-muted mt-3 flex flex-col gap-1.5 not-italic">
              <span>{address}</span>
              <PhoneLink
                phone={site.phone}
                phoneE164={site.phoneE164}
                className="hover:text-ink w-fit"
              />
              <a href={`mailto:${site.email}`} className="hover:text-ink w-fit">
                {site.email}
              </a>
            </address>
            {site.geo ? (
              <>
                <StaticMap
                  lat={site.geo.lat}
                  lng={site.geo.lng}
                  href={mapsHref}
                  label={address}
                  className="mt-5"
                />
                {/* OSM attribution (ODbL) — outside the map link on purpose. */}
                <p className="text-small text-ink-subtle mt-2">
                  Map data ©{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink underline"
                  >
                    OpenStreetMap
                  </a>{" "}
                  contributors
                </p>
              </>
            ) : (
              <p className="mt-5">
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-strong font-semibold"
                >
                  Get directions on Google Maps <span aria-hidden="true">↗</span>
                </a>
              </p>
            )}
          </section>

          <section aria-label="Opening hours">
            <h2 className={H2_CLASS}>Opening hours</h2>
            <dl className="text-body text-ink-muted mt-3 flex max-w-sm flex-col gap-2">
              {hours.map((h) => (
                <div key={h.label} className="flex justify-between gap-4">
                  <dt>{h.label}</dt>
                  <dd className={h.closed ? "text-ink-subtle" : "text-ink font-semibold"}>
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="After-hours emergencies">
            <div className="border-accent-strong bg-panel rounded-card border-l-4 p-5">
              <h2 className={H2_CLASS}>After-hours emergencies</h2>
              <p className="text-body text-ink-muted mt-2">{site.emergency.text}</p>
              {site.emergency.referralPhone && referralTel ? (
                <a
                  href={`tel:${referralTel}`}
                  className="text-brand-strong mt-3 inline-block font-semibold"
                >
                  {site.emergency.referralPhone}
                </a>
              ) : null}
            </div>
          </section>
        </div>

        <div>
          <Card className="p-8">
            <h2 className={H2_CLASS}>Send us a message</h2>
            <p className="text-small text-ink-muted mt-2">
              For general inquiries — we usually reply within one business day. To schedule a
              visit, use{" "}
              <Link
                href={BOOK_HREF}
                className="text-brand-strong font-semibold underline underline-offset-2"
              >
                Book a Visit
              </Link>{" "}
              instead.
            </p>
            <ContactForm phone={site.phone} phoneE164={site.phoneE164} className="mt-6" />
          </Card>
        </div>
      </div>
    </Container>
  );
}
