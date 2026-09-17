import "server-only";

import { cache } from "react";

import type {
  BlogCategoryRow,
  BlogPostRow,
  FeeRow,
  SeoRow,
  ServicePageRow,
  ServiceRow,
  SiteSettingRow,
  TestimonialRow,
} from "@/lib/cms/types";
import { createClient } from "@/utils/supabase/server";

/**
 * Admin-side content reads.
 *
 * Three things separate these from `lib/cms/queries.ts`:
 *
 *  - They go through the cookie-backed client, so the "Admins can manage..."
 *    policies are what authorises them. A non-admin session sees no rows rather
 *    than an error, which is why every page using these also sits behind
 *    `requireAdmin()`.
 *  - They return whole rows — id, publish state, sort order — because an
 *    editing form needs the fields a visitor never sees.
 *  - They see drafts. That is the entire point of them.
 *
 * Kept apart from the write actions on purpose: a file marked `"use server"`
 * publishes every export as a callable endpoint, and a read has no business
 * being one.
 *
 * Errors log and return an empty result rather than throwing. A broken query
 * should show John an empty list he can report, not an error page that loses
 * whatever else was on screen.
 */

/** Newest-relevant-first ordering is per entity; this is just the page size. */
const listLimit = 500;

function logFailure(what: string, error: unknown) {
  console.error(`[cms] Failed to load ${what} for the admin`, error);
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const listServices = cache(async function listServices(): Promise<
  ServiceRow[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(listLimit)
    .returns<ServiceRow[]>();

  if (error) {
    logFailure("services", error);

    return [];
  }

  return data ?? [];
});

export const getService = cache(async function getService(
  id: string,
): Promise<ServiceRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle<ServiceRow>();

  if (error) {
    logFailure(`service ${id}`, error);

    return null;
  }

  return data;
});

/**
 * The long-form page belonging to a service, if it has one.
 *
 * Keyed by `service_id` rather than its own id: there is exactly one page per
 * service (the column is unique), and every route that wants one arrives
 * holding the service, not the page.
 */
export const getServicePageFor = cache(async function getServicePageFor(
  serviceId: string,
): Promise<ServicePageRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("service_pages")
    .select("*")
    .eq("service_id", serviceId)
    .maybeSingle<ServicePageRow>();

  if (error) {
    logFailure(`service page for ${serviceId}`, error);

    return null;
  }

  return data;
});

// ---------------------------------------------------------------------------
// Fees
// ---------------------------------------------------------------------------

export const listFees = cache(async function listFees(): Promise<FeeRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(listLimit)
    .returns<FeeRow[]>();

  if (error) {
    logFailure("fees", error);

    return [];
  }

  return data ?? [];
});

export const getFee = cache(async function getFee(
  id: string,
): Promise<FeeRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .eq("id", id)
    .maybeSingle<FeeRow>();

  if (error) {
    logFailure(`fee ${id}`, error);

    return null;
  }

  return data;
});

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const listTestimonials = cache(async function listTestimonials(): Promise<
  TestimonialRow[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(listLimit)
    .returns<TestimonialRow[]>();

  if (error) {
    logFailure("testimonials", error);

    return [];
  }

  return data ?? [];
});

export const getTestimonial = cache(async function getTestimonial(
  id: string,
): Promise<TestimonialRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle<TestimonialRow>();

  if (error) {
    logFailure(`testimonial ${id}`, error);

    return null;
  }

  return data;
});

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

/** A post as the admin list shows it, with its category name resolved. */
export type AdminBlogPost = BlogPostRow & {
  blog_categories: { name: string } | null;
};

/**
 * Every post, drafts included, newest first.
 *
 * Ordered by `updated_at` rather than `published_at`: this is a work list, and
 * what John wants at the top is the draft he was last editing, not the oldest
 * article that happens to have no publication date.
 */
export const listBlogPosts = cache(async function listBlogPosts(): Promise<
  AdminBlogPost[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(name)")
    .order("updated_at", { ascending: false })
    .limit(listLimit)
    .returns<AdminBlogPost[]>();

  if (error) {
    logFailure("blog posts", error);

    return [];
  }

  return data ?? [];
});

export const getBlogPost = cache(async function getBlogPost(
  id: string,
): Promise<BlogPostRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle<BlogPostRow>();

  if (error) {
    logFailure(`blog post ${id}`, error);

    return null;
  }

  return data;
});

export const listBlogCategories = cache(
  async function listBlogCategories(): Promise<BlogCategoryRow[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name", { ascending: true })
      .returns<BlogCategoryRow[]>();

    if (error) {
      logFailure("blog categories", error);

      return [];
    }

    return data ?? [];
  },
);

/**
 * How many posts sit in each category, keyed by category id.
 *
 * The categories list needs it to say what deleting one would orphan. Counted
 * in one pass over the ids rather than a query per category.
 */
export const countPostsByCategory = cache(
  async function countPostsByCategory(): Promise<Record<string, number>> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .select("category_id")
      .not("category_id", "is", null)
      .returns<{ category_id: string }[]>();

    if (error) {
      logFailure("category post counts", error);

      return {};
    }

    const counts: Record<string, number> = {};

    for (const row of data ?? []) {
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    }

    return counts;
  },
);

// ---------------------------------------------------------------------------
// SEO and settings
// ---------------------------------------------------------------------------

export const listSeoMetadata = cache(async function listSeoMetadata(): Promise<
  SeoRow[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .order("path", { ascending: true })
    .limit(listLimit)
    .returns<SeoRow[]>();

  if (error) {
    logFailure("SEO metadata", error);

    return [];
  }

  return data ?? [];
});

export const listSiteSettings = cache(async function listSiteSettings(): Promise<
  SiteSettingRow[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true })
    .returns<SiteSettingRow[]>();

  if (error) {
    logFailure("site settings", error);

    return [];
  }

  return data ?? [];
});
