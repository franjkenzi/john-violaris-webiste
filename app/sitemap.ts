import type { MetadataRoute } from "next";

import { getSeoOverrides } from "@/lib/cms/queries";
import { belongsInSitemap } from "@/lib/cms/seo/resolve";
import { listSeoRoutes } from "@/lib/cms/seo/routes";
import { deployment } from "@/lib/site-config";

/**
 * `/sitemap.xml`, built from the route registry.
 *
 * The same list the SEO admin edits, so every published page is here and
 * nothing else is: unpublished services and articles are not in the registry,
 * and admin, auth and API routes never are. A page set to "hide from search"
 * or given a canonical elsewhere is left out — see `belongsInSitemap`.
 *
 * `lastmod` comes from the rows' `updated_at`, and only rows have one. The
 * fixed pages leave it out rather than claim the build time as an edit, which
 * is how a sitemap earns search engines ignoring its dates.
 *
 * Cached like any static route; every CMS write that can change it
 * revalidates `/sitemap.xml` (see `lib/cms/revalidate.ts`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, overrides] = await Promise.all([
    listSeoRoutes(),
    getSeoOverrides(),
  ]);

  return routes
    .filter((route) =>
      belongsInSitemap(route.path, overrides[route.path] ?? null, deployment.url),
    )
    .map((route) => ({
      url: new URL(route.path, deployment.url).href,
      ...(route.lastModified ? { lastModified: route.lastModified } : {}),
    }));
}
