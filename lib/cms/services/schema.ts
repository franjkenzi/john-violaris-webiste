import {
  initialCmsFormState,
  type CmsFormState,
  type FieldRule,
} from "@/lib/cms/form";
import type { ServiceRow } from "@/lib/cms/types";

/**
 * The service editor's field list, rules and encoding.
 *
 * Shared by the form and the action that receives it, so the two cannot
 * drift apart.
 *
 * What is deliberately not a field:
 *
 *  - The position. A service sits at the end of its group when it is added or
 *    moved to another group, and the arrows on the list move it within the
 *    group. A raw number would let a service drag its whole group to the top
 *    of the menu, because groups are ordered by their first member.
 *  - `href`. Only police station representation has one, pointing at its own
 *    page, and the save carries it over rather than offering to change it.
 *
 * No server-only imports: the editor is a client component and renders the
 * field errors these rules produce.
 */

export const serviceFields = [
  "name",
  "slug",
  "group",
  "statute",
  "icon",
  "short",
  "intro",
] as const;

export type ServiceField = (typeof serviceFields)[number];

export type ServiceValues = Record<ServiceField, string>;

export const emptyServiceValues: ServiceValues = {
  name: "",
  slug: "",
  group: "",
  statute: "",
  icon: "document",
  short: "",
  intro: "",
};

/**
 * Limits sit at about twice the longest entry the site shipped with. Over-long
 * text is truncated rather than rejected, as everywhere in the CMS, so a limit
 * set close to today's copy would quietly trim it on the next save.
 */
export const serviceRules: Record<ServiceField, FieldRule> = {
  name: { label: "Name", required: true, maxLength: 80 },
  slug: { label: "URL slug", required: true, maxLength: 80, format: "slug" },
  group: { label: "Group", required: true, maxLength: 60 },
  statute: { label: "Reference line", maxLength: 80 },
  icon: { label: "Icon", required: true },
  short: { label: "Short name", maxLength: 40 },
  intro: { label: "Card summary", maxLength: 300 },
};

/**
 * The editor's starting state.
 *
 * Here rather than beside the action: every export of a `"use server"` module
 * has to be an async function.
 */
export const initialServiceFormState: CmsFormState<ServiceField> =
  initialCmsFormState(emptyServiceValues);

/** Row -> editor values. */
export function serviceValuesFrom(row: ServiceRow): ServiceValues {
  const { content } = row;

  return {
    name: row.name,
    slug: row.slug,
    group: content.group ?? "",
    statute: content.statute ?? "",
    icon: content.icon ?? "document",
    short: content.short ?? "",
    intro: content.intro ?? "",
  };
}

/** Where a service links to, as the site works it out in `toService`. */
export function servicePath(row: Pick<ServiceRow, "slug" | "content">): string {
  return row.content.href ?? `/services/${row.slug}`;
}
