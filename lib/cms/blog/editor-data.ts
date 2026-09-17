import "server-only";

import { listBlogCategories, listServices } from "@/lib/cms/admin-queries";
import { toService } from "@/lib/cms/mappers";

/**
 * The lists the article editor needs beside the article itself: categories to
 * file it under, and services to point it at.
 *
 * Shared by the "new" and "edit" routes so the two cannot offer different
 * options. Both reads are `cache()`d, so fetching them together costs one round
 * trip each however many times this is called in a render.
 */
export async function loadEditorData() {
  const [categories, services] = await Promise.all([
    listBlogCategories(),
    listServices(),
  ]);

  return {
    categories: categories.map(({ id, name }) => ({ id, name })),
    // Drafts included: an article may be written ahead of the service page it
    // points at, and the link is checked when the article is published, not
    // while it is being drafted.
    services: services.map((row) => {
      const service = toService(row);

      return { href: service.href, name: service.name };
    }),
  };
}
