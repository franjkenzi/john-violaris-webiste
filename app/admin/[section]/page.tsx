import { notFound } from "next/navigation";

const sections = new Set([
  "website-content",
  "services",
  "service-pages",
  "fees",
  "testimonials",
  "blog-posts",
  "blog-categories",
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
