import type {
  Article,
  Fee,
  Service,
  ServiceGroup,
  Testimonial,
} from "@/lib/cms/types";
import type {
  BlogPostContent,
  FeeContent,
  ServiceContent,
  TestimonialContent,
} from "@/lib/cms/types";

/**
 * Row -> render shape.
 *
 * Both paths into a page go through here: a row read from Postgres and a row
 * read from the static fallback in `lib/cms/seed-data.ts`. Keeping the
 * transformation in one place is what makes the fallback trustworthy — there is
 * no second implementation to drift.
 *
 * The parameter types are structural and ask only for the fields each mapper
 * reads, so a full `ServiceRow` and a `SeedService` (which has no id or
 * timestamps yet) both satisfy them.
 */

type ServiceLike = {
  slug: string;
  name: string;
  content: ServiceContent;
};

export function toService(row: ServiceLike): Service {
  const { content } = row;

  // Key order matches `lib/content/services.ts` so that a service built from a
  // row and the same service written by hand serialise identically — which is
  // what lets the seed be checked against the static catalogue byte for byte.
  return {
    name: row.name,
    href: content.href ?? `/services/${row.slug}`,
    ...(content.statute ? { statute: content.statute } : {}),
    icon: content.icon,
    ...(content.short ? { short: content.short } : {}),
    ...(content.featured ? { featured: true } : {}),
  };
}

/**
 * Rebuild the grouped catalogue the mega-menu renders.
 *
 * Rows must arrive ordered by `sort_order`. Groups come out in the order their
 * first member appears, and members keep the order they arrived in, which is
 * why the seed numbers services across the whole catalogue rather than
 * restarting at each group.
 */
export function toServiceGroups(rows: ServiceLike[]): ServiceGroup[] {
  const groups = new Map<string, ServiceGroup>();

  for (const row of rows) {
    const heading = row.content.group;
    let group = groups.get(heading);

    if (!group) {
      group = { heading, services: [] };
      groups.set(heading, group);
    }

    group.services.push(toService(row));
  }

  return [...groups.values()];
}

/** Service intros, keyed by href, as `serviceDescriptions` is today. */
export function toServiceDescriptions(
  rows: ServiceLike[],
): Record<string, { intro: string }> {
  const descriptions: Record<string, { intro: string }> = {};

  for (const row of rows) {
    if (row.content.intro) {
      descriptions[toService(row).href] = { intro: row.content.intro };
    }
  }

  return descriptions;
}

type FeeLike = {
  title: string;
  price: string | null;
  content: FeeContent;
};

export function toFee(row: FeeLike): Fee {
  return {
    name: row.title,
    // A fee with no figure reads "On enquiry" rather than an empty cell: the
    // fees page is a transparency promise (PRD §6.5) and a blank price reads
    // like an omission.
    price: row.price ?? "On enquiry",
    description: row.content.description,
    included: row.content.included,
  };
}

type TestimonialLike = {
  author: string;
  quote: string;
  rating: number | null;
  content: TestimonialContent;
};

export function toTestimonial(row: TestimonialLike): Testimonial {
  return {
    quote: row.quote,
    name: row.author,
    // Spread rather than assigned, so an untagged review carries no `matter`
    // key at all instead of one set to undefined.
    ...(row.content.matter ? { matter: row.content.matter } : {}),
    // The stars component takes a number. An unrated review shows five stars
    // nowhere — it shows none, which is the honest rendering of "not rated".
    rating: row.rating ?? 0,
    ...(row.content.source ? { source: row.content.source } : {}),
  };
}

type BlogPostLike = {
  slug: string;
  title: string;
  published_at: string | null;
  content: BlogPostContent;
};

export function toArticle(row: BlogPostLike, category: string): Article {
  return {
    ...row.content,
    slug: row.slug,
    title: row.title,
    category,
    publishedAt: row.published_at,
  };
}
