import type { Metadata } from "next";

import type { SeoContent } from "@/lib/cms/types";

/**
 * How a public route's metadata is worked out — the one place that decides it.
 *
 * Three layers can say something about a page's `<head>`, lowest first:
 *
 *  1. The root layout: `metadataBase`, the " | John Violaris" title template,
 *     the fallback description and the default robots directive.
 *  2. The route's own defaults — its heading, its standfirst, an article's
 *     featured image. They live in the route registry, `lib/cms/seo/routes.ts`,
 *     so the SEO admin can show John exactly what a page says until he
 *     changes it.
 *  3. An override saved under SEO Metadata, matched on the exact path.
 *
 * Every public route goes through `resolveMetadata`, and none assembles its
 * own precedence. That is SEO requirement REQ-009, and the reason is
 * practical: when a title is wrong, there is one function to read.
 *
 * Pure on purpose — no database, no `server-only` — so the order can be tested
 * on its own. `seoMetadataFor` in `lib/cms/seo/metadata.ts` is the server
 * wrapper the routes call.
 */

/** What a route says about itself before anyone overrides it. */
export type RouteDefaults = {
  /** The part before the title template's suffix. */
  title: string;
  description?: string;
  /** `article` for a blog post, which also carries `publishedTime`. */
  ogType?: "website" | "article";
  image?: { url: string; alt?: string };
  publishedTime?: string;
};

/**
 * What follows a page title in `<title>`: " | John Violaris".
 *
 * The root layout builds its title template from this, and the share title
 * below adds it by hand — Next applies the template to `<title>` but not to an
 * `openGraph.title` a route sets itself. One definition, so the two cannot
 * drift apart.
 */
export function titleSuffix(siteName: string): string {
  return ` | ${siteName}`;
}

/**
 * Treat blank as unset.
 *
 * The editor stores only what was filled in, but a value that is all spaces —
 * or a row written by hand — must fall through to the default rather than
 * render an empty `<title>`.
 */
function set(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

/**
 * Lay an override over a route's defaults.
 *
 * `openGraph` is always built whole, never partially. Next merges metadata
 * shallowly: a page that sets any `openGraph` field replaces the root
 * layout's entire `openGraph` object, site name and locale included. So they
 * are set here on every route, and `siteName` is passed in rather than
 * trusted to inheritance.
 *
 * `robots` is only included when an override changes it. Left out, the page
 * inherits the root layout's `index, follow`; set to anything, even
 * `undefined`, it would replace it.
 */
export function resolveMetadata(
  path: string,
  defaults: RouteDefaults,
  override: SeoContent | null,
  siteName: string,
): Metadata {
  const title = set(override?.title) ?? defaults.title;
  const description = set(override?.description) ?? defaults.description;
  const canonical = set(override?.canonical) ?? path;

  const overrideImage = set(override?.ogImage);
  const image = overrideImage
    ? { url: overrideImage, alt: set(override?.ogImageAlt) }
    : defaults.image;

  const type = defaults.ogType ?? "website";
  const ogDescription = set(override?.ogDescription) ?? description;

  /*
   * A page shares its full title, name included — which is what Next produced
   * on its own before routes set `openGraph`. An article shares the headline
   * alone, as it always has: the name travels in `og:site_name`, and a
   * headline reads better in a WhatsApp preview without it. A share title
   * written in the editor is used exactly as written.
   */
  const ogTitle =
    set(override?.ogTitle) ??
    (type === "article" ? title : `${title}${titleSuffix(siteName)}`);

  const metadata: Metadata = {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: {
      type,
      locale: "en_GB",
      siteName,
      url: canonical,
      title: ogTitle,
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(image ? { images: [image] } : {}),
      ...(type === "article" && defaults.publishedTime
        ? { publishedTime: defaults.publishedTime }
        : {}),
    },
  };

  if (override?.noIndex || override?.noFollow) {
    metadata.robots = {
      index: !override.noIndex,
      follow: !override.noFollow,
    };
  }

  return metadata;
}

/**
 * Whether a route belongs in the sitemap.
 *
 * Not when it asks to be left out of search, and not when its canonical
 * points somewhere else: listing a URL in the sitemap while its own page says
 * the real one is elsewhere sends search engines two answers.
 */
export function belongsInSitemap(
  path: string,
  override: SeoContent | null,
  siteUrl: string,
): boolean {
  if (override?.noIndex) return false;

  const canonical = set(override?.canonical);

  if (!canonical) return true;

  return new URL(canonical, siteUrl).href === new URL(path, siteUrl).href;
}
