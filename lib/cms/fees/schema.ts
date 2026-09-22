import {
  initialCmsFormState,
  readLines,
  writeLines,
  type CmsFormState,
  type FieldRule,
} from "@/lib/cms/form";
import type { FeeRow } from "@/lib/cms/types";

/**
 * The fee editor's field list, rules and encoding.
 *
 * Shared by the form and the action that receives it, the same way
 * `lib/cms/blog/schema.ts` is, so the two cannot drift apart.
 *
 * No server-only imports: the editor is a client component and renders the
 * field errors this file's rules produce.
 */

export const feeFields = [
  "title",
  "price",
  "description",
  "included",
  "sortOrder",
] as const;

export type FeeField = (typeof feeFields)[number];

export type FeeValues = Record<FeeField, string>;

export const emptyFeeValues: FeeValues = {
  title: "",
  price: "",
  description: "",
  included: "",
  sortOrder: "0",
};

/**
 * `price` is text and optional, and both matter.
 *
 * Text because real entries read "£400", "£750 / £1,100" or "From £X" — a
 * numeric column would force every one of those into a shape it does not have,
 * and then the page would have to put the shape back. Optional because a fee
 * whose figure is not settled should be publishable as "On enquiry" rather
 * than held back or given an invented number; `toFee` supplies that wording.
 */
export const feeRules: Record<FeeField, FieldRule> = {
  title: { label: "Name", required: true, maxLength: 120 },
  price: { label: "Fee", maxLength: 60 },
  description: { label: "Description", required: true, maxLength: 300 },
  // Validated as a block below, because the limit is per line.
  included: { label: "What it includes" },
  sortOrder: { label: "Order", required: true, format: "number" },
};

/** Per line, not for the whole field: each one is a bullet on the card. */
export const includedMaxLength = 200;

/** A ceiling on how many bullets a card lays out before it stops reading as one. */
export const maxIncluded = 12;

export function readIncluded(value: string): string[] {
  return readLines(value)
    .slice(0, maxIncluded)
    .map((line) =>
      line.length > includedMaxLength ? line.slice(0, includedMaxLength) : line,
    );
}

/**
 * The editor's starting state.
 *
 * Here rather than beside the action that consumes it: every export of a
 * `"use server"` module has to be an async function, so a plain constant in
 * `actions.ts` fails the build the moment a Server Component imports from it.
 */
export const initialFeeFormState: CmsFormState<FeeField> =
  initialCmsFormState(emptyFeeValues);

/** Row -> editor values. */
export function feeValuesFrom(row: FeeRow): FeeValues {
  return {
    title: row.title,
    price: row.price ?? "",
    description: row.content.description ?? "",
    included: writeLines(row.content.included),
    sortOrder: String(row.sort_order),
  };
}
