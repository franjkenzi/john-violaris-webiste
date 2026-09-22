"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { iconNames } from "@/components/ui/icons";
import { cn } from "cn";
import { resetPageSection, savePageSection } from "@/lib/cms/sections/actions";
import {
  fieldName,
  initialSectionFormState,
  itemCountName,
  itemFieldName,
  type ItemField,
  type SectionContent,
  type SectionDefinition,
  type SectionField,
} from "@/lib/cms/sections/schema";
import {
  emptyItemRow,
  itemRowsFrom,
  sectionValuesFrom,
} from "@/lib/cms/sections/values";

/**
 * The editor for one page section.
 *
 * Generic on purpose. Every section is a list of fields described in
 * `lib/cms/sections/schema.ts`, so this renders from that description rather
 * than being written out per section — which is what keeps twenty-odd editable
 * sections to one form instead of twenty forms that drift apart.
 *
 * Each section is its own `<form>` and its own row, so saving the hero cannot
 * touch the process steps, and a rejected save leaves the rest of the page
 * alone. That is also why an accordion of sections works here: nothing is lost
 * by collapsing one.
 *
 * Repeating rows are React state rather than uncontrolled inputs, for the same
 * reason the article editor's are: they can be added, removed and reordered,
 * and React resets a form after an action settles, which would empty them on a
 * rejected save.
 */

export type SectionFormProps = {
  page: string;
  definition: SectionDefinition;
  /** What is stored, or undefined when the section has never been edited. */
  stored: SectionContent | undefined;
};

type Row = Record<string, string> & { _key?: string };

export function SectionForm({ page, definition, stored }: SectionFormProps) {
  // The defaults underneath are what the site renders today, so an untouched
  // section opens showing the live copy rather than an empty form.
  const content: SectionContent = { ...definition.defaults, ...(stored ?? {}) };

  const [state, formAction] = useActionState(savePageSection, {
    ...initialSectionFormState,
    values: sectionValuesFrom(definition, content),
  });

  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  const itemFields = definition.fields.filter(
    (field) => field.kind === "items",
  );

  const [rows, setRows] = useState<Record<string, Row[]>>(() =>
    Object.fromEntries(
      itemFields.map((field) => [
        field.key,
        itemRowsFrom(field, content).map(withKey),
      ]),
    ),
  );

  useEffect(() => {
    if (state.status !== "error") return;

    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );

    (firstInvalid ?? alertRef.current)?.focus();
  }, [state]);

  const errorId = (key: string) =>
    state.fieldErrors[key] ? `${formId}-${key}-error` : undefined;

  function updateRow(field: string, index: number, key: string, value: string) {
    setRows((current) => ({
      ...current,
      [field]: current[field].map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    }));
  }

  function moveRow(field: string, index: number, by: -1 | 1) {
    setRows((current) => {
      const next = [...current[field]];
      const target = index + by;

      if (target < 0 || target >= next.length) return current;

      [next[index], next[target]] = [next[target], next[index]];

      return { ...current, [field]: next };
    });
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="section" value={definition.key} />

      {state.message ? (
        <p
          ref={alertRef}
          tabIndex={-1}
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm outline-none",
            state.status === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-primary/30 bg-primary/5 text-foreground",
          )}
        >
          {state.message}
        </p>
      ) : null}

      {definition.fields.map((field) =>
        field.kind === "items" ? (
          <ItemsField
            key={field.key}
            field={field}
            formId={formId}
            rows={rows[field.key] ?? []}
            error={state.fieldErrors[field.key]}
            errorId={errorId(field.key)}
            onUpdate={(index, key, value) =>
              updateRow(field.key, index, key, value)
            }
            onMove={(index, by) => moveRow(field.key, index, by)}
            onRemove={(index) =>
              setRows((current) => ({
                ...current,
                [field.key]: current[field.key].filter((_, i) => i !== index),
              }))
            }
            onAdd={() =>
              setRows((current) => ({
                ...current,
                [field.key]: [
                  ...current[field.key],
                  withKey(emptyItemRow(field)),
                ],
              }))
            }
          />
        ) : (
          <ScalarField
            key={field.key}
            field={field}
            formId={formId}
            value={state.values[field.key] ?? ""}
            error={state.fieldErrors[field.key]}
            errorId={errorId(field.key)}
          />
        ),
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <SaveButton />
        {stored ? <ResetSection page={page} definition={definition} /> : null}
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save section"}
    </Button>
  );
}

/**
 * Put a section back to the copy the site shipped with.
 *
 * Only offered once a section has actually been edited — there is nothing to
 * undo otherwise, and a button that always does nothing is worse than no
 * button. A sibling form rather than a nested one, which is invalid HTML, and
 * the confirm sits on the submit event so a keyboard submit is caught too.
 */
function ResetSection({
  page,
  definition,
}: {
  page: string;
  definition: SectionDefinition;
}) {
  return (
    <form
      action={resetPageSection}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Discard your edits to "${definition.label}" and go back to the original wording?`,
        );

        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="section" value={definition.key} />
      <Button type="submit" variant="ghost" size="sm">
        <RotateCcw aria-hidden="true" />
        Revert to original
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------

function ScalarField({
  field,
  formId,
  value,
  error,
  errorId,
}: {
  field: SectionField;
  formId: string;
  value: string;
  error?: string;
  errorId?: string;
}) {
  const id = `${formId}-${field.key}`;
  const shared = {
    id,
    name: fieldName(field.key),
    defaultValue: value,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": errorId,
  };

  return (
    <Field
      label={field.label}
      labelFor={id}
      hint={field.hint}
      error={error}
      errorId={errorId}
      required={field.required}
    >
      {field.kind === "text" ? (
        <Input {...shared} />
      ) : (
        <Textarea rows={field.rows ?? 3} {...shared} />
      )}
    </Field>
  );
}

function ItemsField({
  field,
  formId,
  rows,
  error,
  errorId,
  onUpdate,
  onMove,
  onRemove,
  onAdd,
}: {
  field: SectionField;
  formId: string;
  rows: Row[];
  error?: string;
  errorId?: string;
  onUpdate: (index: number, key: string, value: string) => void;
  onMove: (index: number, by: -1 | 1) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  if (!field.item) return null;

  const { label: itemLabel, fields: subFields, max } = field.item;
  const atMax = max !== undefined && rows.length >= max;

  return (
    <fieldset className="rounded-xl border p-3 md:p-4">
      <legend className="px-1 text-sm leading-none font-medium">
        {field.label}
      </legend>

      {field.hint ? (
        <p className="mt-1 mb-3 text-xs text-muted-foreground">{field.hint}</p>
      ) : (
        <div className="mb-3" />
      )}

      <input type="hidden" name={itemCountName(field.key)} value={rows.length} />

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      ) : null}

      <ol className="space-y-3">
        {rows.map((row, index) => (
          <li key={row._key} className="rounded-lg border p-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {itemLabel} {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                >
                  <ArrowUp aria-hidden="true" />
                  <span className="sr-only">
                    Move {itemLabel.toLowerCase()} {index + 1} up
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === rows.length - 1}
                  onClick={() => onMove(index, 1)}
                >
                  <ArrowDown aria-hidden="true" />
                  <span className="sr-only">
                    Move {itemLabel.toLowerCase()} {index + 1} down
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">
                    Remove {itemLabel.toLowerCase()} {index + 1}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {subFields.map((sub) => (
                <ItemInput
                  key={sub.key}
                  sub={sub}
                  id={`${formId}-${field.key}-${index}-${sub.key}`}
                  name={itemFieldName(field.key, index, sub.key)}
                  value={row[sub.key] ?? ""}
                  onChange={(value) => onUpdate(index, sub.key, value)}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={atMax}
        onClick={onAdd}
      >
        <Plus aria-hidden="true" />
        Add {itemLabel.toLowerCase()}
      </Button>

      {atMax ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {max} is as many as this section lays out.
        </p>
      ) : null}
    </fieldset>
  );
}

function ItemInput({
  sub,
  id,
  name,
  value,
  onChange,
}: {
  sub: ItemField;
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={sub.label} labelFor={id} hint={sub.hint}>
      {sub.kind === "icon" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        >
          {iconNames.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      ) : sub.kind === "text" ? (
        <Input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Textarea
          id={id}
          name={name}
          rows={sub.rows ?? 3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

/** A labelled control with its hint and error. Mirrors the article editor's. */
function Field({
  label,
  labelFor,
  hint,
  error,
  errorId,
  required,
  children,
}: {
  label: string;
  labelFor: string;
  hint?: string;
  error?: string;
  errorId?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={labelFor}>
        {label}
        {required ? null : (
          <span className="text-xs font-normal text-muted-foreground">
            optional
          </span>
        )}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A stable React key for a row.
 *
 * Index keys would do the wrong thing on reorder and removal — React would
 * reuse the inputs in place and the text would appear to jump between rows.
 */
function withKey(row: Record<string, string>): Row {
  return { ...row, _key: crypto.randomUUID() };
}
