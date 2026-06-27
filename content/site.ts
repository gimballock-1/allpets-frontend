import type { SiteSettingInput } from "@/lib/content/schema";

/**
 * Site-wide clinic settings (8.1) — the SiteSetting source consumed by the Footer
 * (8.6), Contact page (8.10), booking fallback (9.5 → phone), and schema.org (12.4).
 *
 * ⚠️ PROVISIONAL placeholder values — the real clinic phone / hours / address /
 * emergency copy are confirmed in Epic 18 (#3 phone, #4 hours, #6 emergency, etc.).
 * Phone uses the reserved-fictional 555-01xx range until then. Edit this file +
 * commit to publish (set-and-forget; no CMS).
 */
export const site: SiteSettingInput = {
  clinicName: "All Pets Veterinary Hospital",
  legalName: "All Pets Veterinary Hospital, PLLC",
  tagline: "Compassionate care for every pet, every visit.",

  hero: {
    headline: "Compassionate care for every paw, claw & whisker.",
    subcopy:
      "Full-service veterinary care for the dogs, cats, and families of Norman, Oklahoma — wellness, dentistry, surgery, and more, all under one roof.",
    imageAlt: "A friendly dog and cat resting together",
  },

  phone: "(405) 555-0123",
  phoneE164: "+14055550123",
  email: "hello@allpets.skpodduturi.dev",

  address: {
    street: "1234 Example Ave",
    city: "Norman",
    state: "OK",
    zip: "73069",
    country: "US",
  },
  geo: { lat: 35.2226, lng: -97.4395 },

  // 24h times; null/null ⇒ closed. PROVISIONAL — confirm in 18.4.
  hours: [
    { day: "monday", open: "08:00", close: "18:00" },
    { day: "tuesday", open: "08:00", close: "18:00" },
    { day: "wednesday", open: "08:00", close: "18:00" },
    { day: "thursday", open: "08:00", close: "18:00" },
    { day: "friday", open: "08:00", close: "18:00" },
    { day: "saturday", open: "09:00", close: "13:00" },
    { day: "sunday", open: null, close: null },
  ],

  emergency: {
    text: "For after-hours emergencies, please call the Oklahoma Veterinary Emergency hospital. (Confirm the exact referral in 18.6.)",
    referralPhone: "(405) 555-0199",
  },

  socials: [
    { platform: "Facebook", url: "https://facebook.com/allpetsnorman" },
    { platform: "Instagram", url: "https://instagram.com/allpetsnorman" },
  ],

  footerLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],

  bookingNote: "New patients welcome — book online any time.",
};
