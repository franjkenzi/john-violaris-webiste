import type { IconName } from "@/components/ui/icons";

/**
 * The service catalogue as the site shipped with it.
 *
 * No longer what the site renders: the catalogue is edited under Services in
 * the CMS and read through `lib/cms/queries.ts`. This module is the seed that
 * filled the `services` table and the fallback served when Supabase cannot be
 * read — see `lib/cms/seed-data.ts`. The types below are still the definition
 * of what a service *is*; an edit to the words belongs in the CMS.
 *
 * Statute references are standard citations but should be confirmed by John
 * before launch.
 */

export type Service = {
  name: string;
  href: string;
  statute?: string;
  icon: IconName;
  /** Shorter label for the compact rail, where the full name is too long. */
  short?: string;
  /** Shown in the compact rail beneath the hero. */
  featured?: boolean;
};

export type ServiceGroup = {
  heading: string;
  services: Service[];
};

/**
 * The one group whose services are not motoring offences.
 *
 * An offence page treats its services differently: the reference line under
 * the name is a descriptor ("Where most cases are heard") rather than a
 * statute, so it is not read back as one, and the checklist does not ask for a
 * driving record. The heading is editable in the CMS, which is why it is named
 * here once and the service editor says what renaming it would change.
 */
export const representationGroup = "Representation";

export const serviceGroups: ServiceGroup[] = [
  {
    heading: "Drugs & Alcohol",
    services: [
      {
        name: "Drink Driving",
        href: "/services/drink-driving",
        statute: "s.5 RTA 1988",
        icon: "glass",
        featured: true,
      },
      {
        name: "Drug Driving",
        href: "/services/drug-driving",
        statute: "s.5A RTA 1988",
        icon: "leaf",
        featured: true,
      },
      {
        name: "Failing to Provide a Specimen",
        short: "Failing to Provide",
        href: "/services/failing-to-provide",
        statute: "s.7 RTA 1988",
        icon: "vial",
      },
      {
        name: "Drunk in Charge",
        href: "/services/drunk-in-charge",
        statute: "s.5(1)(b) RTA 1988",
        icon: "glass",
      },
    ],
  },
  {
    heading: "Licence & points",
    services: [
      {
        name: "Totting Up · 12 Points",
        short: "Totting Up",
        href: "/services/totting-up",
        statute: "s.35 RTOA 1988",
        icon: "points",
        featured: true,
      },
      {
        name: "Exceptional Hardship",
        href: "/services/exceptional-hardship",
        statute: "s.35 RTOA 1988",
        icon: "scales",
      },
      {
        name: "Special Reasons",
        href: "/services/special-reasons",
        statute: "s.34 RTOA 1988",
        icon: "spark",
        featured: true,
      },
    ],
  },
  {
    heading: "Driving standards",
    services: [
      {
        name: "Speeding",
        href: "/services/speeding",
        statute: "s.89 RTRA 1984",
        icon: "camera",
        featured: true,
      },
      {
        name: "Careless Driving",
        href: "/services/careless-driving",
        statute: "s.3 RTA 1988",
        icon: "car",
        featured: true,
      },
      {
        name: "Dangerous Driving",
        href: "/services/dangerous-driving",
        statute: "s.2 RTA 1988",
        icon: "alert",
        featured: true,
      },
      {
        name: "Using Mobile Phone",
        href: "/services/mobile-phone",
        statute: "s.41D RTA 1988",
        icon: "phone",
        featured: true,
      },
    ],
  },
  {
    heading: "Documents & procedure",
    services: [
      {
        name: "Driving Without Insurance",
        short: "No Insurance",
        href: "/services/no-insurance",
        statute: "s.143 RTA 1988",
        icon: "document",
        featured: true,
      },
      {
        name: "Failing to Stop or Report",
        href: "/services/failing-to-stop",
        statute: "s.170 RTA 1988",
        icon: "stop",
      },
      {
        name: "Failing to Provide Driver Details",
        href: "/services/driver-details",
        statute: "s.172 RTA 1988",
        icon: "mail",
      },
    ],
  },
  {
    heading: representationGroup,
    services: [
      {
        name: "Police Station",
        href: "/police-station",
        statute: "Free under legal aid in most cases",
        icon: "shield",
        featured: true,
      },
      {
        name: "Magistrates Court",
        href: "/services/magistrates-court",
        statute: "Where most cases are heard",
        icon: "scales",
      },
      {
        // Deliberately not `featured`: the rail beneath the hero is the
        // motoring practice, and the general crime work sits behind it
        // rather than alongside it. The slug stays `criminal-defence`:
        // it is the page's canonical URL and renaming the card is not a
        // reason to break a link that is already out there.
        name: "All Crime",
        href: "/services/criminal-defence",
        statute: "Every allegation, not just motoring",
        icon: "alert",
      },
      {
        name: "Non-Motoring Crime",
        href: "/services/all-crime",
        statute: "Legal aid and private instruction",
        icon: "document",
      },
    ],
  },
];
