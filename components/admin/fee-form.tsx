"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ExternalLink, Trash2 } from "lucide-react";

import { DetachedActionForm } from "@/components/admin/detached-action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import { useControlledAfterReset } from "@/hooks/use-controlled-after-reset";
import { deleteFee, saveFee } from "@/lib/cms/fees/actions";
import {
  emptyFeeValues,
  initialFeeFormState,
  maxIncluded,
  type FeeField,
  type FeeValues,
} from "@/lib/cms/fees/schema";

/**
 * The fee editor.
 *
 * Plain fields throughout — no repeating rows — so the text inputs keep
 * `defaultValue` from the echoed state, as the contact form does. The two
 * checkboxes are React state, because React resets a form after an action
 * settles and an unchecked box is indistinguishable from a missing one.
 */

export type FeeFormProps = {
  /** Null when adding a fee. */
  fee: {
    id: string;
    values: FeeValues;
    published: boolean;
    tableOnly: boolean;
  } | null;
};

export function FeeForm({ fee }: FeeFormProps) {
  const initialValues = fee?.values ?? emptyFeeValues;

  const [state, formAction] = useActionState(saveFee, {
    ...initialFeeFormState,
    values: initialValues,
  });

  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  useControlledAfterReset(formRef);
  const alertRef = useRef<HTMLParagraphElement>(null);

  const [published, setPublished] = useState(fee?.published ?? false);
  const [tableOnly, setTableOnly] = useState(fee?.tableOnly ?? false);

  useEffect(() => {
    if (state.status !== "error") return;

    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );

    (firstInvalid ?? alertRef.current)?.focus();
  }, [state]);

  const errorId = (field: FeeField) =>
    state.fieldErrors[field] ? `${formId}-${field}-error` : undefined;

  const fieldProps = (field: FeeField) => ({
    id: `${formId}-${field}`,
    name: field,
    defaultValue: state.values[field],
    "aria-invalid": state.fieldErrors[field] ? (true as const) : undefined,
    "aria-describedby": errorId(field),
  });

  const deleteFormId = `${formId}-delete`;

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-8">
        {fee ? <input type="hidden" name="id" value={fee.id} /> : null}

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

        {/* ------------------------------------------------------------------ */}
        <section className="space-y-4 rounded-xl border p-4 md:p-5">
          <h2 className="font-display text-lg font-semibold">The fee</h2>

          <Field
            label="Name"
            labelFor={`${formId}-title`}
            hint="What the fee is for, e.g. “Single hearing”."
            error={state.fieldErrors.title}
            errorId={errorId("title")}
          >
            <Input {...fieldProps("title")} />
          </Field>

          <Field
            label="Description"
            labelFor={`${formId}-description`}
            hint="The line under the name, e.g. “Magistrates’ Court — guilty plea or first appearance”."
            error={state.fieldErrors.description}
            errorId={errorId("description")}
          >
            <Input {...fieldProps("description")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Fee"
              labelFor={`${formId}-price`}
              hint="Written as it should read: “£400”, “£750 / £1,100”, “From £500”. Left blank it shows as “On enquiry”."
              error={state.fieldErrors.price}
              errorId={errorId("price")}
            >
              <Input placeholder="£400" {...fieldProps("price")} />
            </Field>

            <Field
              label="Order"
              labelFor={`${formId}-sortOrder`}
              hint="Lower numbers come first. Use the arrows on the list instead of editing this."
              error={state.fieldErrors.sortOrder}
              errorId={errorId("sortOrder")}
            >
              <Input
                type="number"
                step={10}
                className="w-auto"
                {...fieldProps("sortOrder")}
              />
            </Field>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        <section className="space-y-4 rounded-xl border p-4 md:p-5">
          <h2 className="font-display text-lg font-semibold">What it includes</h2>

          <Field
            label="Included work"
            labelFor={`${formId}-included`}
            hint={`One item per line, up to ${maxIncluded}. These are the ticked lines on the card.`}
            error={state.fieldErrors.included}
            errorId={errorId("included")}
          >
            <Textarea rows={6} {...fieldProps("included")} />
          </Field>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="tableOnly"
              checked={tableOnly}
              onChange={(event) => setTableOnly(event.target.checked)}
              className="mt-0.5 size-4 rounded border-input accent-primary"
            />
            <span className="text-sm">
              <span className="font-medium">Table only — no card</span>
              <span className="mt-0.5 block text-muted-foreground">
                For a fee that is an add-on to an instruction rather than a way to
                instruct John, like an adjourned hearing. It is listed in the full
                table but given no card, and needs no included lines.
              </span>
            </span>
          </label>
        </section>

        {/* ------------------------------------------------------------------ */}
        <section className="space-y-4 rounded-xl border p-4 md:p-5">
          <h2 className="font-display text-lg font-semibold">Publication</h2>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="published"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="mt-0.5 size-4 rounded border-input accent-primary"
            />
            <span className="text-sm">
              <span className="font-medium">Published</span>
              <span className="mt-0.5 block text-muted-foreground">
                A published fee appears on the fees page. Unpublish one to take it
                off the site without deleting it.
              </span>
            </span>
          </label>
        </section>

        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SaveButton isNew={!fee} />
            <Link
              href="/admin/fees"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Back to all fees
            </Link>
            {fee?.published ? (
              <a
                href="/fees"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                View on the site
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>

          {fee ? (
            <Button
              type="submit"
              form={deleteFormId}
              variant="destructive"
              size="sm"
            >
              <Trash2 aria-hidden="true" />
              Delete fee
            </Button>
          ) : null}
        </div>
      </form>
      {fee ? (
        <DetachedActionForm
          id={deleteFormId}
          action={deleteFee}
          confirmMessage={`Permanently delete the "${fee.values.title}" fee? This cannot be undone — to take it off the site and keep it, unpublish it instead.`}
          fields={{ id: fee.id }}
        />
      ) : null}
    </>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Add fee" : "Save changes"}
    </Button>
  );
}

/** A labelled control with its hint and error. Mirrors the article editor's. */
function Field({
  label,
  labelFor,
  hint,
  error,
  errorId,
  children,
}: {
  label: string;
  labelFor: string;
  hint?: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={labelFor}>{label}</Label>
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
