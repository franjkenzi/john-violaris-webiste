import "server-only";

import { cache } from "react";

import {
  toArticle,
  toFee,
  toService,
  toServiceDescriptions,
  toServiceGroups,
  toTestimonial,
} from "@/lib/cms/mappers";
import {
  seedBlogCategories,
  seedBlogPosts,
  seedFees,
  seedServicePages,
  seedServices,
  seedTestimonials,
} from "@/lib/cms/seed-data";
import type {
  Article,
  BlogCategoryRow,
  BlogPostContent,
  Fee,
  SeoContent,
  Service,
  ServiceContent,
  ServiceGroup,
  ServicePageContent,
  Testimonial,
} from "@/lib/cms/types";
import { publicClient } from "@/utils/supabase/public";

/**
 * Public content reads.
 *
 * Three rules hold everything here together:
 *
 *  1. Anon client, no cookies. Every public page on this site is statically
 *     rendered, and a page that reads `cookies()` cannot be. RLS is what limits
 *     these reads to published rows — not an `.eq("published", true)` that a
 *     later refactor could quietly drop.
 *
 *  2. `cache()` on every read. A page and its layout render in the same pass
 *     and several of them want the service catalogue; deduping turns three
 *     identical round trips into one.
 *
 *  3. Fall back on failure, never on emptiness. If Supabase errors or is
 *     unconfigured, the static seed is served and the failure is logged loudly.
 *     If it answers with no rows, that is the truthful answer — nothing is
 *     published — and the page renders empty. Anything else would make it
 *     impossible for John to unpublish the last testimonial.
 *
 * Admin reads, which must also see drafts, live in `lib/cms/admin-queries.ts`.
 */

/**
 * Run a read, or fall back to the static seed and say so.
 *
 * `console.error` rather than a rethrow on purpose: at build time a throw would
 * fail the deploy over content that has a perfectly good local copy, and during
 * revalidation it would serve a stale page with no explanation. Both are worse
 * than correct content plus a loud log.
 */
async function safely<T>(
  label: string,
  run: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(
      `[cms] ${label} could not be read from Supabase — serving static content instead.`,
      error,
    );

    return fallback();
  }
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

type ServiceSelect = {
  slug: string;
  name: string;
  content: ServiceContent;
};

const serviceSelect = "slug, name, content";

/** Published services, in catalogue order. */
const getServiceRows = cache(async function getServiceRows(): Promise<ServiceSelect[]> {
  return safely(
    "Service catalogue",
    async () => {
      const { data, error } = await publicClient()
        .from("services")
        .select(serviceSelect)
        .order("sort_order", { ascending: true })
        .returns<ServiceSelect[]>();

      if (error) throw error;

      return data ?? [];
    },
    () => seedServices,
  );
});

/** The grouped catalogue behind the mega-menu and the services index. */
export const getServiceGroups = cache(
  async function getServiceGroups(): Promise<ServiceGroup[]> {
    return toServiceGroups(await getServiceRows());
  },
);

/** Every published service, flat. */
export const getServices = cache(async function getServices(): Promise<Service[]> {
  return (await getServiceRows()).map(toService);
});

/** The subset shown in the compact rail beneath the hero. */
export const getFeaturedServices = cache(
  async function getFeaturedServices(): Promise<Service[]> {
    return (await getServices()).filter((service) => service.featured);
  },
);

/** Service intros keyed by href, shaped as `serviceDescriptions` is today. */
export const getServiceDescriptions = cache(
  async function getServiceDescriptions(): Promise<Record<string, { intro: string }>> {
    return toServiceDescriptions(await getServiceRows());
  },
);

type ServicePageSelect = {
  content: ServicePageContent;
  services: ServiceSelect;
};

/**
 * One offence page and the service it belongs to.
 *
 * An inner join rather than two queries: an unpublished service must not leave
 * a published page of its own reachable, and the join expresses that inside the
 * query instead of in a forgettable check afterwards.
 */
export const getServicePage = cache(async function getServicePage(
  slug: string,
): Promise<{ service: Service; detail: ServicePageContent } | null> {
  return safely(
    `Service page "${slug}"`,
    async () => {
      const { data, error } = await publicClient()
        .from("service_pages")
        .select(`content, services!inner(${serviceSelect})`)
        .eq("services.slug", slug)
        .maybeSingle<ServicePageSelect>();

      if (error) throw error;
      if (!data) return null;

      return { service: toService(data.services), detail: data.content };
    },
    () => {
      const page = seedServicePages.find((row) => row.serviceSlug === slug);
      const service = seedServices.find((row) => row.slug === slug);

      if (!page || !service) return null;

      return { service: toService(service), detail: page.content };
    },
  );
});

/**
 * Slugs with a published page, for `generateStaticParams`.
 *
 * Not every service has one — police station representation is served by its
 * own route — so this asks the join rather than assuming the whole catalogue.
 */
export const getServicePageSlugs = cache(
  async function getServicePageSlugs(): Promise<string[]> {
    return safely(
      "Service page slugs",
      async () => {
        const { data, error } = await publicClient()
          .from("service_pages")
          .select("services!inner(slug)")
          .returns<{ services: { slug: string } }[]>();

        if (error) throw error;

        return (data ?? []).map((row) => row.services.slug);
      },
      () => seedServicePages.map((row) => row.serviceSlug),
    );
  },
);

// ---------------------------------------------------------------------------
// Fees
// ---------------------------------------------------------------------------

type FeeSelect = {
  title: string;
  price: string | null;
  content: import("@/lib/cms/types").FeeContent;
};

export const getFees = cache(async function getFees(): Promise<Fee[]> {
  return safely(
    "Fee schedule",
    async () => {
      const { data, error } = await publicClient()
        .from("fees")
        .select("title, price, content")
        .order("sort_order", { ascending: true })
        .returns<FeeSelect[]>();

      if (error) throw error;

      return (data ?? []).map(toFee);
    },
    () => seedFees.map(toFee),
  );
});

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

type TestimonialSelect = {
  author: string;
  quote: string;
  rating: number | null;
  content: import("@/lib/cms/types").TestimonialContent;
};

export const getTestimonials = cache(
  async function getTestimonials(): Promise<Testimonial[]> {
    return safely(
      "Testimonials",
      async () => {
        const { data, error } = await publicClient()
          .from("testimonials")
          .select("author, quote, rating, content")
          .order("sort_order", { ascending: true })
          .returns<TestimonialSelect[]>();

        if (error) throw error;

        return (data ?? []).map(toTestimonial);
      },
      () => seedTestimonials.map(toTestimonial),
    );
  },
);

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

type BlogPostSelect = {
  slug: string;
  title: string;
  published_at: string | null;
  content: BlogPostContent;
  blog_categories: { name: string } | null;
};

const blogPostSelect = "slug, title, published_at, content, blog_categories(name)";

/** Shown when a post has no category, rather than an empty pill on the card. */
const uncategorised = "Guides";

/** Category name for a seeded post, for the fallback path. */
function seedCategoryName(categorySlug: string): string {
  return (
    seedBlogCategories.find((category) => category.slug === categorySlug)?.name ??
    uncategorised
  );
}

/**
 * Published articles, newest first.
 *
 * `published_at` is null on the seeded articles — they carry no publication
 * date, and inventing one would date content John has not yet approved — so the
 * ordering falls through to `created_at`, keeping undated posts in a stable
 * order rather than whatever Postgres returns.
 */
export const getArticles = cache(async function getArticles(): Promise<Article[]> {
  return safely(
    "Articles",
    async () => {
      const { data, error } = await publicClient()
        .from("blog_posts")
        .select(blogPostSelect)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .returns<BlogPostSelect[]>();

      if (error) throw error;

      return (data ?? []).map((row) =>
        toArticle(row, row.blog_categories?.name ?? uncategorised),
      );
    },
    () =>
      seedBlogPosts.map((row) => toArticle(row, seedCategoryName(row.categorySlug))),
  );
});

export const getArticle = cache(async function getArticle(
  slug: string,
): Promise<Article | null> {
  return safely(
    `Article "${slug}"`,
    async () => {
      const { data, error } = await publicClient()
        .from("blog_posts")
        .select(blogPostSelect)
        .eq("slug", slug)
        .maybeSingle<BlogPostSelect>();

      if (error) throw error;
      if (!data) return null;

      return toArticle(data, data.blog_categories?.name ?? uncategorised);
    },
    () => {
      const row = seedBlogPosts.find((post) => post.slug === slug);

      return row ? toArticle(row, seedCategoryName(row.categorySlug)) : null;
    },
  );
});

export const getBlogCategories = cache(
  async function getBlogCategories(): Promise<
    Pick<BlogCategoryRow, "slug" | "name">[]
  > {
    return safely(
      "Blog categories",
      async () => {
        const { data, error } = await publicClient()
          .from("blog_categories")
          .select("slug, name")
          .order("name", { ascending: true })
          .returns<Pick<BlogCategoryRow, "slug" | "name">[]>();

        if (error) throw error;

        return data ?? [];
      },
      () => seedBlogCategories,
    );
  },
);

// ---------------------------------------------------------------------------
// SEO and settings
// ---------------------------------------------------------------------------

/**
 * Per-route SEO overrides, or null when the route has none.
 *
 * Null is the normal case, not a failure: a page that has never been given an
 * override keeps the title and description written in its own file. The admin
 * section fills these in, and `generateMetadata` layers them over the page
 * defaults rather than replacing them wholesale.
 */
export const getSeo = cache(async function getSeo(
  path: string,
): Promise<SeoContent | null> {
  return safely(
    `SEO metadata for "${path}"`,
    async () => {
      const { data, error } = await publicClient()
        .from("seo_metadata")
        .select("content")
        .eq("path", path)
        .maybeSingle<{ content: SeoContent }>();

      if (error) throw error;

      return data?.content ?? null;
    },
    () => null,
  );
});

/**
 * Every site setting, as one object.
 *
 * One query rather than one per key: there are a dozen of them, they are all
 * tiny, and most pages want several. Callers read what they need from the
 * result; `lib/site-config.ts` stays the place that supplies the defaults when
 * a key is unset.
 */
export const getSiteSettings = cache(
  async function getSiteSettings(): Promise<Record<string, unknown>> {
    return safely(
      "Site settings",
      async () => {
        const { data, error } = await publicClient()
          .from("site_settings")
          .select("key, value")
          .returns<{ key: string; value: unknown }[]>();

        if (error) throw error;

        return Object.fromEntries(
          (data ?? []).map(({ key, value }) => [key, value]),
        );
      },
      () => ({}),
    );
  },
);
