import { slugify } from "@/lib/slug";

/**
 * Shared shape and validation for every CMS editing form.
 *
 * Follows the idiom already set by `lib/enquiries/schema.ts`: hand-rolled
 * validation rather than a schema library, a state object shaped for
 * `useActionState`, and errors written as instructions rather than diagnostics.
 * The difference is the audience — these messages are read by John, who knows
 * what a slug is, so they can say what is actually wrong.
 *
 * Deliberately free of server-only imports. The admin forms are client
 * components and render the same `fieldErrors` the server action produced.
 */

/** Returned by every CMS action and consumed by `useActionState`. */
export type CmsFormState<F extends string = string> = {
  status: "idle" | "success" | "error";
  /** Shown above the form. Null while idle. */
  message: string | null;
  fieldErrors: Partial<Record<F, string>>;
  /** Echoed back so a rejected submission never empties the form. */
  values: Record<F, string>;
};

export function initialCmsFormState<F extends string>(
  values: Record<F, string>,
): CmsFormState<F> {
  return { status: "idle", message: null, fieldErrors: {}, values };
}

/** A rejection carrying per-field messages, for returning straight from an action. */
export function formError<F extends string>(
  values: Record<F, string>,
  fieldErrors: Partial<Record<F, string>>,
  message = "Some details need checking before this can be saved.",
): CmsFormState<F> {
  return { status: "error", message, fieldErrors, values };
}

/** A failure with no particular field to blame — a dropped connection, say. */
export function formFailure<F extends string>(
  values: Record<F, string>,
  message: string,
): CmsFormState<F> {
  return { status: "error", message, fieldErrors: {}, values };
}

export function formSuccess<F extends string>(
  values: Record<F, string>,
  message: string,
): CmsFormState<F> {
  return { status: "success", message, fieldErrors: {}, values };
}

// ---------------------------------------------------------------------------
// Reading a submission
// ---------------------------------------------------------------------------

/**
 * Pull the named fields out of a `FormData` as trimmed strings.
 *
 * Everything arrives as a string, including numbers and dates: a form field is
 * text until something decides otherwise, and keeping one representation means
 * the state echoed back into the inputs needs no conversion. `rules` below is
 * where a field becomes a number.
 *
 * A missing field reads as empty rather than throwing. A `FormData` that has
 * lost a field is a bug worth seeing as a validation message on the form, not a
 * 500 on submit.
 */
export function readFields<F extends string>(
  formData: FormData,
  fields: readonly F[],
): Record<F, string> {
  const values = {} as Record<F, string>;

  for (const field of fields) {
    const value = formData.get(field);

    values[field] = typeof value === "string" ? value.trim() : "";
  }

  return values;
}

/**
 * An unchecked checkbox sends nothing at all, so its absence is the value.
 * Never read one through `readFields` — an empty string is not `false` there,
 * it is "the field was missing", and the two look identical.
 */
export function readCheckbox(formData: FormData, field: string): boolean {
  return formData.get(field) !== null;
}

/**
 * Split a textarea into a list, one item per line.
 *
 * Used for the list fields — what a fee includes, the points examined on an
 * offence page. Blank lines are dropped so a trailing newline does not become
 * an empty bullet on the page.
 */
export function readLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** The inverse, for loading a stored list back into a textarea. */
export function writeLines(values: string[] | undefined): string {
  return (values ?? []).join("\n");
}

/**
 * Split a textarea into paragraphs, on blank lines rather than single ones.
 *
 * Prose is not a list. Someone writing an article will wrap a long sentence, or
 * paste text that arrives already wrapped, and every one of those line breaks
 * would otherwise become a new `<p>`. A blank line is the one break a writer
 * makes deliberately.
 */
export function readParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** The inverse, for loading stored prose back into a textarea. */
export function writeParagraphs(values: string[] | undefined): string {
  return (values ?? []).join("\n\n");
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type FieldRule = {
  /** Names the field in its error messages, e.g. "Title". */
  label: string;
  required?: boolean;
  maxLength?: number;
  /**
   * `slug` accepts lowercase letters, numbers and single hyphens.
   * `number` accepts a whole number, positive or negative.
   * `date` accepts `YYYY-MM-DD`, which is what a native date input sends.
   */
  format?: "text" | "slug" | "number" | "date";
};

export type ValidationResult<F extends string> =
  | { ok: true; values: Record<F, string> }
  | { ok: false; fieldErrors: Partial<Record<F, string>> };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const integerPattern = /^-?\d+$/;

/**
 * Check a submission against a declarative rule set.
 *
 * Truncates to `maxLength` rather than rejecting: a pasted description two
 * characters over the limit should save, not bounce back. A required field that
 * is empty, or a slug that is not a slug, is a genuine error and does bounce.
 */
export function validateFields<F extends string>(
  input: Record<F, string>,
  rules: Record<F, FieldRule>,
): ValidationResult<F> {
  const values = { ...input };
  const fieldErrors: Partial<Record<F, string>> = {};

  for (const field of Object.keys(rules) as F[]) {
    const rule = rules[field];
    let value = (values[field] ?? "").trim();

    if (rule.maxLength && value.length > rule.maxLength) {
      value = value.slice(0, rule.maxLength);
    }

    values[field] = value;

    if (!value) {
      if (rule.required) {
        fieldErrors[field] = `${rule.label} cannot be empty.`;
      }

      // An optional field left blank has nothing left to check.
      continue;
    }

    if (rule.format === "slug" && !slugPattern.test(value)) {
      fieldErrors[field] =
        `${rule.label} can use lowercase letters, numbers and hyphens only — for example "${slugify(value) || "drink-driving"}".`;
    }

    if (rule.format === "number" && !integerPattern.test(value)) {
      fieldErrors[field] = `${rule.label} must be a whole number.`;
    }

    if (rule.format === "date" && !datePattern.test(value)) {
      fieldErrors[field] = `${rule.label} must be a date.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, values };
}

/**
 * Turn a validated numeric field into a number.
 *
 * Only safe after `validateFields` has passed it, which is why it does not
 * re-check: `fallback` covers the optional-and-left-blank case, not a bad one.
 */
export function asNumber(value: string, fallback = 0): number {
  return value ? Number(value) : fallback;
}

/** A blank optional field is stored as null, not as an empty string. */
export function asNullable(value: string): string | null {
  return value || null;
}

/**
 * Translate a Postgres error into something worth reading.
 *
 * Only the ones a content editor can actually cause are named. Everything else
 * keeps its own message, which is more useful in a log than a cheerful
 * paraphrase would be.
 */
export function describeDatabaseError(error: {
  code?: string;
  message?: string;
}): string {
  // unique_violation — almost always a slug that is already taken.
  if (error.code === "23505") {
    return "Something already uses that slug. Choose a different one.";
  }

  // foreign_key_violation — a category deleted in another tab, say.
  if (error.code === "23503") {
    return "Something this refers to no longer exists. Reload the page and try again.";
  }

  return error.message ?? "This could not be saved. Please try again.";
}
