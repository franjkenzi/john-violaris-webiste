import { notFound } from "next/navigation";

/**
 * CMS sections that do not have a route yet.
 *
 * A section leaves this list when it gets a real page under `app/admin/`: a
 * static segment wins over this dynamic one, so `blog-posts` and
 * `blog-categories` no longer reach here at all. Keeping them listed would only
 * hide a routing mistake.
 */
const sections = new Set([
  "services",
  "service-pages",
  "fees",
  "seo-metadata",
  "site-settings",
]);

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!sections.has(section)) notFound();

  return null;
}
