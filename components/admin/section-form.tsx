"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { RotateCcw } from "lucide-react";

import { DetachedActionForm } from "@/components/admin/detached-action-form";
import { ItemsField, useItemRows } from "@/components/admin/items-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import { useControlledAfterReset } from "@/hooks/use-controlled-after-reset";
import { resetPageSection, savePageSection } from "@/lib/cms/sections/actions";
import {
  fieldName,
  initialSectionFormState,
  type SectionContent,
  type SectionDefinition,
  type SectionField,
} from "@/lib/cms/sections/schema";
import { itemRowsFrom, sectionValuesFrom } from "@/lib/cms/sections/values";

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
 * Repeating rows come from `ItemsField`, shared with the offence-page editor.
 */

export type SectionFormProps = {
  page: string;
  definition: SectionDefinition;
  /** What is stored, or undefined when the section has never been edited. */
  stored: SectionContent | undefined;
};

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
  useControlledAfterReset(formRef);
  const alertRef = useRef<HTMLParagraphElement>(null);

  const rowsFor = useItemRows(
    Object.fromEntries(
      definition.fields
        .filter((field) => field.kind === "items")
        .map((field) => [field.key, itemRowsFrom(field, content)]),
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

  const resetFormId = `${formId}-reset`;

  return (
    <>
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
              error={state.fieldErrors[field.key]}
              errorId={errorId(field.key)}
              {...rowsFor(field)}
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
          {/* Only once a section has been edited: there is nothing to undo
              otherwise, and a button that always does nothing is worse than
              no button. */}
          {stored ? (
            <Button type="submit" form={resetFormId} variant="ghost" size="sm">
              <RotateCcw aria-hidden="true" />
              Revert to original
            </Button>
          ) : null}
        </div>
      </form>
      {stored ? (
        <DetachedActionForm
          id={resetFormId}
          action={resetPageSection}
          confirmMessage={`Discard your edits to "${definition.label}" and go back to the original wording?`}
          fields={{ page, section: definition.key }}
        />
      ) : null}
    </>
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
