import "server-only";

import type { Metadata } from "next";

import { getSeo, getSiteConfig } from "@/lib/cms/queries";
import { defaultShareImage, resolveMetadata } from "@/lib/cms/seo/resolve";
import { findSeoRoute } from "@/lib/cms/seo/routes";

/**
 * A public route's metadata: its registry defaults with any saved override
 * laid over them.
 *
 * What every public route's `generateMetadata` returns, so none of them holds
 * a title or a precedence rule of its own. A path that is not a public route —
 * an unpublished service, an article that does not exist — gets nothing, and
 * the page's own `notFound()` answers for it.
 */
export async function seoMetadataFor(path: string): Promise<Metadata> {
  const [route, override, config] = await Promise.all([
    findSeoRoute(path),
    getSeo(path),
    getSiteConfig(),
  ]);

  if (!route) return {};

  return resolveMetadata(
    path,
    route.defaults,
    override,
    config.name,
    defaultShareImage(config.name, config.role),
  );
}
