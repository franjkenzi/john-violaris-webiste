import type { SectionContent } from "@/lib/cms/sections/schema";

/**
 * Lay an edited section over the copy it was written with.
 *
 * A stored row holds whatever the editor last saved, which need not be every
 * field: a section gains a field whenever one is added to the registry, and
 * rows saved before that have nothing under the new key. Spreading the defaults
 * first means a missing key falls back to what the page shipped with rather
 * than rendering as `undefined`, and a new field works on an already-edited
 * section without a migration.
 *
 * The cast is the one place a jsonb column becomes a typed shape. It is safe in
 * the direction that matters — every key the component reads has a default
 * behind it — and the admin form is the only writer, so the values under those
 * keys are the kinds the fields declare. A hand-edited row with the wrong kind
 * under a key would render oddly rather than throw, which is the right failure:
 * it is content, not code.
 *
 * Deliberately not `server-only`: client components take resolved content as a
 * prop, and the hero is one of them.
 */
export function resolveSection<T extends object>(
  defaults: T,
  stored: SectionContent | undefined,
): T {
  if (!stored) return defaults;

  return { ...defaults, ...(stored as Partial<T>) };
}

/**
 * The same, for a whole page.
 *
 * `content` is what `getPageContent` returns — the sections of one page that
 * have actually been edited, keyed by section. Sections absent from it have
 * never been touched.
 */
export function resolveFrom(
  content: Record<string, SectionContent>,
): <T extends object>(section: string, defaults: T) => T {
  return (section, defaults) => resolveSection(defaults, content[section]);
}
