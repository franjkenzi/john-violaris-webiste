import { isIconName } from "@/components/ui/icons";
import {
  readLines,
  readParagraphs,
  writeLines,
  writeParagraphs,
} from "@/lib/cms/form";
import {
  itemCountName,
  itemFieldName,
  type ItemField,
  type SectionContent,
  type SectionDefinition,
  type SectionField,
  type SectionItem,
} from "@/lib/cms/sections/schema";

/**
 * Moving a section between three representations.
 *
 * Stored content is typed data — `string[]` of lines, `string[]` of paragraphs,
 * arrays of item objects. A form is text. This file converts between them, and
 * it is imported by both the editor and the action that receives it so a field
 * cannot be written one way and read another.
 *
 * No server-only imports: the editor is a client component.
 */

/** Editor text for one scalar field. */
export function fieldValueFrom(
  field: SectionField,
  content: SectionContent,
): string {
  const value = content[field.key];

  switch (field.kind) {
    case "text":
    case "image":
      return typeof value === "string" ? value : "";
    case "lines":
    case "list":
      return writeLines(asStrings(value));
    case "prose":
      return writeParagraphs(asStrings(value));
    // Items are rows, not text, and come through `itemRowsFrom`.
    case "items":
      return "";
  }
}

/** Every scalar field of a section, as the editor's starting values. */
export function sectionValuesFrom(
  definition: SectionDefinition,
  content: SectionContent,
): Record<string, string> {
  const values: Record<string, string> = {};

  for (const field of definition.fields) {
    if (field.kind === "items") continue;

    values[field.key] = fieldValueFrom(field, content);
  }

  return values;
}

/** Editor text for one field inside an item row. */
export function itemValueFrom(field: ItemField, item: SectionItem): string {
  const value = item[field.key];

  if (field.kind === "prose") return writeParagraphs(asStrings(value));

  return typeof value === "string" ? value : "";
}

/** The rows of one repeating field, as editor text. */
export function itemRowsFrom(
  field: SectionField,
  content: SectionContent,
): Record<string, string>[] {
  if (field.kind !== "items" || !field.item) return [];

  const stored = content[field.key];

  if (!Array.isArray(stored)) return [];

  return stored
    .filter((item): item is SectionItem => isItem(item))
    .map((item) =>
      Object.fromEntries(
        field.item!.fields.map((sub) => [sub.key, itemValueFrom(sub, item)]),
      ),
    );
}

/** An empty row, for "Add" in the editor. */
export function emptyItemRow(field: SectionField): Record<string, string> {
  if (field.kind !== "items" || !field.item) return {};

  return Object.fromEntries(field.item.fields.map((sub) => [sub.key, ""]));
}

// ---------------------------------------------------------------------------
// The other direction: editor text back into stored content
// ---------------------------------------------------------------------------

/**
 * Parse one scalar field's editor text.
 *
 * Truncation rather than rejection on `maxLength`, matching `validateFields` —
 * a pasted sentence slightly over the limit should save. For the multi-entry
 * kinds the limit applies to each line or paragraph, because that is the unit
 * the page lays out.
 */
export function parseField(field: SectionField, raw: string): string | string[] {
  const clamp = (value: string) =>
    field.maxLength && value.length > field.maxLength
      ? value.slice(0, field.maxLength)
      : value;

  switch (field.kind) {
    case "text":
    case "image":
      return clamp(raw.trim());
    case "lines":
    case "list":
      return readLines(raw).map(clamp);
    case "prose":
      return readParagraphs(raw).map(clamp);
    case "items":
      return [];
  }
}

/** Parse one field inside an item row. */
export function parseItemField(
  field: ItemField,
  raw: string,
): string | string[] {
  const clamp = (value: string) =>
    field.maxLength && value.length > field.maxLength
      ? value.slice(0, field.maxLength)
      : value;

  if (field.kind === "prose") return readParagraphs(raw).map(clamp);

  return clamp(raw.trim());
}

/** Is a field's parsed value empty — nothing typed at all? */
export function isEmptyValue(value: string | string[]): boolean {
  return Array.isArray(value) ? value.length === 0 : value.length === 0;
}

/** A ceiling on the item scan, so a forged count cannot spin the loop. */
const maxItemScan = 60;

/**
 * Read one repeating field's rows out of a submission.
 *
 * Shared by every action that saves repeating rows — page sections and offence
 * pages — so the encoding the editor writes is read back in one place.
 *
 * The declared count bounds the scan rather than probing until a gap: a row
 * removed from the middle of the editor would end the scan early otherwise and
 * silently drop everything after it.
 *
 * A row with nothing in any field is dropped. That is the empty row the editor
 * adds on "Add" and then nobody fills in, and saving it would put a blank card
 * on the page. A row with *something* in it but a required part missing is an
 * error instead, because dropping it would lose what was typed.
 */
export function readItems(
  field: SectionField,
  formData: FormData,
): { items: SectionItem[]; error?: string } {
  if (!field.item) return { items: [] };

  const declared = Number(formData.get(itemCountName(field.key)) ?? 0);
  const count = Number.isFinite(declared)
    ? Math.min(Math.max(Math.trunc(declared), 0), maxItemScan)
    : 0;

  const items: SectionItem[] = [];
  let error: string | undefined;

  for (let index = 0; index < count; index += 1) {
    const item: SectionItem = {};
    let empty = true;

    for (const sub of field.item.fields) {
      const raw = formData.get(itemFieldName(field.key, index, sub.key));
      const value = parseItemField(sub, typeof raw === "string" ? raw : "");

      // A `select` always submits one of its options, so it says nothing about
      // whether anyone wrote in the row. Left to count, every blank row would
      // be "something typed" and bounce back as missing its other parts.
      if (sub.kind !== "select" && !isEmptyValue(value)) empty = false;

      item[sub.key] = value;
    }

    if (empty) continue;

    for (const sub of field.item.fields) {
      const value = item[sub.key] as string | string[];

      // An icon or an option that is not one we have would render nothing at
      // all, so it falls back rather than being stored and puzzled over later.
      if (sub.kind === "icon" && !isIconName(value)) {
        item[sub.key] = "document";
      } else if (
        sub.kind === "select" &&
        !sub.options?.some((option) => option.value === value)
      ) {
        item[sub.key] = sub.options?.[0]?.value ?? "";
      } else if (sub.required && isEmptyValue(value)) {
        error ??= `${field.item.label} ${items.length + 1} needs its ${sub.label.toLowerCase()} filled in.`;
      }
    }

    items.push(item);
  }

  if (error) return { items, error };

  if (field.item.max && items.length > field.item.max) {
    return {
      items: items.slice(0, field.item.max),
      error: `${field.label} can hold up to ${field.item.max}. The rest were not saved.`,
    };
  }

  return { items };
}

// ---------------------------------------------------------------------------

function asStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function isItem(value: unknown): value is SectionItem {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
