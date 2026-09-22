import {
  readLines,
  readParagraphs,
  writeLines,
  writeParagraphs,
} from "@/lib/cms/form";
import type {
  ItemField,
  SectionContent,
  SectionDefinition,
  SectionField,
  SectionItem,
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

// ---------------------------------------------------------------------------

function asStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function isItem(value: unknown): value is SectionItem {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
