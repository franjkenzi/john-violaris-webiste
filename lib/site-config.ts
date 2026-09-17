/**
 * Central site configuration.
 *
 * Every phone number, address, email and external URL used anywhere on the
 * site is defined here once. Nothing contact-related should be hardcoded in a
 * component. Values marked PLACEHOLDER are deliberately obvious and must be
 * replaced with John's real details before launch — see `docs` note in README.
 *
 * Later these values move behind the CMS (Site Settings table); the shape below
 * is the contract the rest of the app codes against.
 */

export type NavLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "John Violaris",
  role: "Criminal Defence Solicitor",
  roleLong: "Criminal Defence Solicitor & Motoring Specialist",
  initials: "JV",
  jurisdiction: "England & Wales",

  /** Primary/canonical domain. Secondary domains should 301 here. */
  url: "https://johnviolaris.com",
  secondaryUrl: "https://drivingjustice.co.uk",

  contact: {
    /** PLACEHOLDER — replace with John's real number. */
    phoneDisplay:
      process.env.NEXT_PUBLIC_PHONE_DISPLAY || "Phone details pending",
    /** PLACEHOLDER — E.164 format, used for tel: links. */
    phoneE164: process.env.NEXT_PUBLIC_PHONE_NUMBER || "",
    /**
     * PLACEHOLDER — John's WhatsApp number. Any ordinary shape is accepted
     * (`+44 7700 900123`, `07700 900123`, `447700900123`); it is normalised
     * for `wa.me` by `normaliseWhatsappNumber` below.
     */
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    /** Dialling code assumed when a number is written in national form. */
    countryCode: "44",
    email: "contact@johnviolaris.com",
    responseTime: "Response within 24 hours",
  },

  /** Set the confirmed TidyCal URL; otherwise direct visitors to contact. */
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "/contact#consultation",

  /**
   * Set the verified SRA number once confirmed; no number is invented.
   */
  sraNumber: null as string | null,
} as const;

/** `tel:` href for the configured phone number. */
export const telHref = siteConfig.contact.phoneE164
  ? `tel:${siteConfig.contact.phoneE164}`
  : "/contact#urgent";

/** `mailto:` href for the configured email address. */
export const mailtoHref = `mailto:${siteConfig.contact.email}`;

/**
 * WhatsApp click-to-chat (PRD §8 — no Business API, just a `wa.me` link).
 *
 * `wa.me` takes digits only: no `+`, spaces, brackets or trunk prefix. Rather
 * than trust whatever shape the configured value arrives in, it is normalised
 * here, so `+44 7700 900123`, `07700 900123` and `447700900123` all produce
 * the same link. A value that cannot be read as a number yields `null` rather
 * than a broken chat link.
 */
function normaliseWhatsappNumber(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");

  // `00` is the international access prefix; any `+` is already stripped.
  if (digits.startsWith("00")) digits = digits.slice(2);

  // A single leading `0` is a national trunk prefix. The practice covers
  // England & Wales only, so it resolves against the configured dialling code.
  if (digits.startsWith("0")) {
    digits = siteConfig.contact.countryCode + digits.slice(1);
  }

  // E.164 permits at most 15 digits; anything under 8 is not a phone number.
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** Normalised WhatsApp number, or `null` when none is configured. */
export const whatsappNumber = siteConfig.contact.whatsappNumber
  ? normaliseWhatsappNumber(siteConfig.contact.whatsappNumber)
  : null;

/**
 * Click-to-chat href, or `null` when no usable number is configured.
 *
 * Null rather than a fallback route on purpose: the caller has to decide what
 * to render instead, so nothing can end up labelled "WhatsApp" while quietly
 * pointing at the contact page.
 *
 * Called without a `subject` the chat opens empty, so the visitor says it in
 * their own words. Only a page that already knows the matter — a service page
 * — puts anything in the box, and then only the name of the offence.
 */
export function whatsappHref(subject?: string): string | null {
  if (!whatsappNumber) return null;
  if (!subject) return `https://wa.me/${whatsappNumber}`;

  const message = `Hello John, I'd like to speak to you about ${subject}.`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Primary header / mobile navigation. */
export const mainNav: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Police Station", href: "/police-station" },
  { label: "Fees", href: "/fees" },
  { label: "Resources", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Footer link columns. */
export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Services",
    links: [
      { label: "Drink & Drug Driving", href: "/services/drink-driving" },
      { label: "Totting Up & 12 Points", href: "/services/totting-up" },
      { label: "Special Reasons", href: "/services/special-reasons" },
      { label: "Speeding", href: "/services/speeding" },
      { label: "Police Station", href: "/police-station" },
      { label: "All Services", href: "/services" },
    ],
  },
  {
    heading: "Information",
    links: [
      { label: "About John", href: "/about" },
      { label: "Fees & Pricing", href: "/fees" },
      { label: "Useful Information", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
