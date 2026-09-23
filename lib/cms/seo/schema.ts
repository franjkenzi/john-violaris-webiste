import {
  initialCmsFormState,
  type CmsFormState,
  type FieldRule,
} from "@/lib/cms/form";
import type { SeoContent } from "@/lib/cms/types";

/**
 * The SEO editor's field list, rules and encoding.
 *
 * Every field is optional, because every field is an override: left blank, the
 * page keeps what it says by default — its heading, its standfirst — and the
 * editor shows that default in the empty field so John can see what he would
 * be replacing.
 *
 * Deliberately not here:
 *
 *  - A separate on-page heading. The visible headings are edited where they
 *    live, under Website Content and Service Pages; SEO requirement REQ-003 is
 *    met by the search title and the heading already being independent.
 *  - The Open Graph type. It follows the route: articles are `article`,
 *    everything else `website`.
 *  - Twitter/X fields. X reads the Open Graph tags when its own are absent.
 *
 * No server-only imports: the editor is a client component.
 */

export const seoFields = [
  "title",
  "description",
  "canonical",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "ogImageAlt",
] as const;

export type SeoField = (typeof seoFields)[number];

export type SeoValues = Record<SeoField, string>;

export const emptySeoValues: SeoValues = {
  title: "",
  description: "",
  canonical: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogImageAlt: "",
};

/**
 * Hard limits are generous and truncate, as everywhere in the CMS — a pasted
 * paragraph should save, not bounce. The lengths that matter for search are
 * the advisory ones below, which the editor counts against as you type.
 */
export const seoRules: Record<SeoField, FieldRule> = {
  title: { label: "Search title", maxLength: 120 },
  description: { label: "Search description", maxLength: 320 },
  canonical: { label: "Canonical address", maxLength: 300 },
  ogTitle: { label: "Share title", maxLength: 120 },
  ogDescription: { label: "Share description", maxLength: 320 },
  ogImage: { label: "Share image", maxLength: 500 },
  ogImageAlt: { label: "Image description", maxLength: 200 },
};

/**
 * Where Google starts cutting a result short, near enough. The title count
 * includes " | John Violaris", because that is what Google shows.
 */
export const titleWarnAt = 60;
export const descriptionWarnAt = 155;

/**
 * The editor's state. `reset` marks the answer to "Reset to defaults", which
 * the editor needs to know apart from an ordinary save: its own fields still
 * hold the override that was just removed, and have to be emptied.
 */
export type SeoFormState = CmsFormState<SeoField> & { reset?: boolean };

/**
 * The editor's starting state.
 *
 * Here rather than beside the action: every export of a `"use server"` module
 * has to be an async function.
 */
export const initialSeoFormState: SeoFormState =
  initialCmsFormState(emptySeoValues);

/** Stored override -> editor values. */
export function seoValuesFrom(content: SeoContent | null): SeoValues {
  return {
    title: content?.title ?? "",
    description: content?.description ?? "",
    canonical: content?.canonical ?? "",
    ogTitle: content?.ogTitle ?? "",
    ogDescription: content?.ogDescription ?? "",
    ogImage: content?.ogImage ?? "",
    ogImageAlt: content?.ogImageAlt ?? "",
  };
}
