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
    /** PLACEHOLDER — international format without +, used for wa.me links. */
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    whatsappMessage:
      "Hello John, I'd like to speak to you about a motoring matter.",
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

/** WhatsApp click-to-chat href with a pre-filled introductory message. */
export const whatsappHref = siteConfig.contact.whatsappNumber
  ? `https://wa.me/${
      siteConfig.contact.whatsappNumber
    }?text=${encodeURIComponent(siteConfig.contact.whatsappMessage)}`
  : "/contact#consultation";

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
