"use server";

import { isIconName } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth";
import {
  formError,
  initialCmsFormState,
  type CmsFormState,
} from "@/lib/cms/form";
import { revalidateFor, type RevalidateTarget } from "@/lib/cms/revalidate";
import {
  fieldName,
  findSection,
  itemCountName,
  itemFieldName,
  type SectionContent,
  type SectionDefinition,
  type SectionField,
  type SectionItem,
} from "@/lib/cms/sections/schema";
import {
  isEmptyValue,
  parseField,
  parseItemField,
  sectionValuesFrom,
} from "@/lib/cms/sections/values";
import { cmsWrite } from "@/lib/cms/write";
import { createClient } from "@/utils/supabase/server";

/**
 * Saving a page section.
 *
 * One action for every section on the site rather than one per section: a
 * section is its field list, and the field list is data in
 * `lib/cms/sections/schema.ts`. What arrives in the `FormData` is decided by
 * the same registry the editor rendered from, so a field added there is
 * editable and saved without a line of code here changing.
 *
 * `page` and `section` come from the submission and are looked up in the
 * registry before anything else happens. A Server Action is a public POST
 * endpoint, so a pair that is not in the registry is refused rather than
 * written — that check is what stops arbitrary rows being inserted into the
 * table by a hand-made request.
 */

export const initialSectionFormState: CmsFormState = initialCmsFormState({});

/** A ceiling on the item scan, so a forged count cannot spin the loop. */
const maxItems = 60;

export async function savePageSection(
  _previous: CmsFormState,
  formData: FormData,
): Promise<CmsFormState> {
  await requireAdmin();

  const page = readString(formData, "page");
  const key = readString(formData, "section");
  const definition = findSection(page, key);

  if (!definition) {
    return {
      status: "error",
      message:
        "That section is not one this site has. Reload the page and try again.",
      fieldErrors: {},
      values: {},
    };
  }

  const submitted = readSubmittedValues(definition, formData);
  const content: SectionContent = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of definition.fields) {
    if (field.kind === "items") {
      const { items, error } = readItems(field, formData);

      if (error) fieldErrors[field.key] = error;

      content[field.key] = items;

      continue;
    }

    const value = parseField(field, submitted[field.key] ?? "");

    if (field.required && isEmptyValue(value)) {
      fieldErrors[field.key] = `${field.label} cannot be empty.`;
    }

    content[field.key] = value;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return formError(submitted, fieldErrors);
  }

  return cmsWrite({
    entity: "page-sections",
    values: submitted,
    successMessage: `${definition.label} saved.`,
    paths: routesFor(definition),
    // `onConflict` rather than an id: a section is identified by where it is,
    // and the unique constraint on (page, section) is what makes saving an
    // untouched section an insert and saving an edited one an update, with no
    // round trip in between to find out which.
    run: async (supabase) =>
      supabase
        .from("page_sections")
        .upsert({ page, section: key, content }, { onConflict: "page,section" })
        .select("section")
        .maybeSingle(),
  });
}

/**
 * Put a section back to the copy the site shipped with.
 *
 * Deleting the row rather than writing the defaults into it: the defaults live
 * in `lib/content/pages.ts` and the read falls back to them when no row exists,
 * so an absent row *is* the default. Writing a copy of them would freeze
 * today's wording into the database and quietly detach the section from the
 * file that defines it.
 */
export async function resetPageSection(formData: FormData) {
  await requireAdmin();

  const page = readString(formData, "page");
  const key = readString(formData, "section");
  const definition = findSection(page, key);

  if (!definition) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("page", page)
    .eq("section", key);

  if (error) {
    console.error(`[cms] Failed to reset section ${page}/${key}`, error);

    return;
  }

  revalidateFor("page-sections", routesFor(definition));
}

// ---------------------------------------------------------------------------

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

/**
 * The scalar fields as submitted, before parsing.
 *
 * Echoed back on a rejection so the editor keeps what was typed, which is why
 * these are the raw textarea strings rather than the parsed arrays — putting a
 * parsed value back in a textarea would silently reformat someone's draft while
 * telling them to fix something else.
 */
function readSubmittedValues(
  definition: SectionDefinition,
  formData: FormData,
): Record<string, string> {
  const values = sectionValuesFrom(definition, {});

  for (const field of definition.fields) {
    if (field.kind === "items") continue;

    values[field.key] = readString(formData, fieldName(field.key));
  }

  return values;
}

/**
 * Read one repeating field's rows.
 *
 * The declared count bounds the scan rather than probing until a gap: a row
 * removed from the middle of the editor would end the scan early otherwise and
 * silently drop everything after it.
 *
 * A row with nothing in any field is dropped. That is the empty row the editor
 * adds on "Add" and then nobody fills in, and saving it would put a blank card
 * on the page.
 */
function readItems(
  field: SectionField,
  formData: FormData,
): { items: SectionItem[]; error?: string } {
  if (!field.item) return { items: [] };

  const declared = Number(formData.get(itemCountName(field.key)) ?? 0);
  const count = Number.isFinite(declared)
    ? Math.min(Math.max(Math.trunc(declared), 0), maxItems)
    : 0;

  const items: SectionItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const item: SectionItem = {};
    let empty = true;

    for (const sub of field.item.fields) {
      const raw = readString(formData, itemFieldName(field.key, index, sub.key));
      const value = parseItemField(sub, raw);

      // An icon that is not one we have would render nothing at all, so it
      // falls back rather than being stored and puzzled over later.
      item[sub.key] =
        sub.kind === "icon" && !isIconName(value) ? "document" : value;

      if (!isEmptyValue(value)) empty = false;
    }

    if (!empty) items.push(item);
  }

  if (field.item.max && items.length > field.item.max) {
    return {
      items: items.slice(0, field.item.max),
      error: `${field.label} can hold up to ${field.item.max}. The rest were not saved.`,
    };
  }

  return { items };
}

/**
 * The public routes a section change affects.
 *
 * `"*"` is the closing call to action, which is in the body of every page. It
 * becomes a layout revalidation of the root, the same sweep `site-settings`
 * uses, because naming twenty-odd routes by hand is a list that would be wrong
 * the next time one is added.
 */
function routesFor(definition: SectionDefinition): RevalidateTarget[] {
  return definition.appearsOn.includes("*")
    ? [{ path: "/", type: "layout" }]
    : definition.appearsOn;
}
