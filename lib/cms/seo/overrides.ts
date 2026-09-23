import "server-only";

import { createClient } from "@/utils/supabase/server";

/**
 * Keeping SEO overrides attached to the page they were written for.
 *
 * Overrides are keyed by path, so they follow the address rather than the
 * row. When an address changes or goes away, the override has to be told:
 *
 *  - An article renamed from `/blog/a` to `/blog/b` keeps its search title,
 *    rather than dropping back to defaults while the old one sits on an
 *    address nothing serves.
 *  - A deleted article or service takes its override with it, rather than
 *    handing it silently to whatever is published at that address next.
 *
 * Both run after the content write has succeeded, under the admin's own
 * session, and neither is allowed to fail the save it follows: a stray
 * override is untidy, a lost article edit is not acceptable. Failures log.
 */

export async function moveSeoOverride(from: string, to: string): Promise<void> {
  if (from === to) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("seo_metadata")
    .update({ path: to })
    .eq("path", from);

  if (error) {
    console.error(`[cms] Could not move the SEO override from ${from} to ${to}`, error);
  }
}

export async function dropSeoOverride(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("seo_metadata").delete().eq("path", path);

  if (error) {
    console.error(`[cms] Could not remove the SEO override for ${path}`, error);
  }
}
