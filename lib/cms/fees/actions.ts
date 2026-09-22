"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import {
  asNullable,
  asNumber,
  formError,
  readCheckbox,
  readFields,
  validateFields,
  type CmsFormState,
} from "@/lib/cms/form";
import {
  feeFields,
  feeRules,
  readIncluded,
  type FeeField,
} from "@/lib/cms/fees/schema";
import { revalidateFor } from "@/lib/cms/revalidate";
import type { FeeContent } from "@/lib/cms/types";
import { cmsWrite } from "@/lib/cms/write";
import { createClient } from "@/utils/supabase/server";

/**
 * Fee mutations.
 *
 * Everything goes through `cmsWrite`, which confirms the caller is an admin,
 * runs the statement under the caller's own RLS, rebuilds the affected routes
 * and hands back a form state. What is left here is the field list and the
 * query.
 *
 * Fees appear on `/fees` and on the home page's fee preview, both of which
 * `revalidate.ts` already lists for this entity, so no caller passes a path.
 */

export async function saveFee(
  _previous: CmsFormState<FeeField>,
  formData: FormData,
): Promise<CmsFormState<FeeField>> {
  await requireAdmin();

  const id = formData.get("id");
  const feeId = typeof id === "string" && id ? id : null;

  const submitted = readFields(formData, feeFields);
  const published = readCheckbox(formData, "published");
  const tableOnly = readCheckbox(formData, "tableOnly");
  const included = readIncluded(submitted.included);

  const validation = validateFields(submitted, feeRules);

  if (!validation.ok) {
    return formError(submitted, validation.fieldErrors);
  }

  const values = validation.values;

  /*
   * A card with no bullets is a card with a hole in it. The table row has no
   * bullets by design, so the requirement follows `tableOnly` rather than
   * being unconditional — and an unpublished fee is exempt either way, which
   * is what makes it possible to save a fee half-written.
   */
  if (published && !tableOnly && included.length === 0) {
    return formError(values, {
      included:
        "A fee shown as a card needs at least one line saying what it includes.",
    });
  }

  const content: FeeContent = {
    description: values.description,
    included,
    ...(tableOnly ? { tableOnly: true } : {}),
  };

  const row = {
    title: values.title,
    // Null rather than "" for a blank figure: `toFee` turns null into
    // "On enquiry", and an empty string would print an empty cell instead.
    price: asNullable(values.price),
    published,
    sort_order: asNumber(values.sortOrder),
    content,
  };

  const state = await cmsWrite<FeeField, { id: string } | null>({
    entity: "fees",
    values,
    successMessage: published ? "Fee saved and published." : "Draft saved.",
    run: async (supabase) =>
      feeId
        ? supabase.from("fees").update(row).eq("id", feeId).select("id").maybeSingle()
        : supabase.from("fees").insert(row).select("id").maybeSingle(),
  });

  if (state.status === "success" && !feeId && state.data?.id) {
    // Straight into the editor for the fee that now exists, so the next save
    // updates it rather than inserting a second one.
    redirect(`/admin/fees/${state.data.id}`);
  }

  // Rebuilt field by field rather than spread: `data` stays on the server.
  return {
    status: state.status,
    message: state.message,
    fieldErrors: state.fieldErrors,
    values: state.values,
  };
}

/**
 * Publish or unpublish from the list, without opening the fee.
 *
 * Called inside a transition rather than as a form action, so the row can paint
 * the new state optimistically. Arguments are still treated as untrusted: a
 * Server Action is a public POST endpoint whatever calls it.
 */
export async function setFeePublished(id: string, published: boolean) {
  await requireAdmin();

  if (typeof id !== "string" || typeof published !== "boolean") return;

  const supabase = await createClient();

  const { error } = await supabase.from("fees").update({ published }).eq("id", id);

  if (error) {
    console.error(`[cms] Failed to change publish state of fee ${id}`, error);

    return;
  }

  revalidateFor("fees");
}

/**
 * Move a fee up or down the schedule.
 *
 * Swaps the two rows' `sort_order` values rather than renumbering the list.
 * Two updates, and the gaps the seed left between them stay intact.
 */
export async function moveFee(id: string, direction: "up" | "down") {
  await requireAdmin();

  if (typeof id !== "string" || (direction !== "up" && direction !== "down")) {
    return;
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("fees")
    .select("id, sort_order")
    .eq("id", id)
    .maybeSingle<{ id: string; sort_order: number }>();

  if (!current) return;

  // The nearest row on the chosen side. Ordering by `sort_order` and taking
  // one is what makes this a swap with the neighbour rather than with whatever
  // row happens to come back first.
  const { data: neighbour } = await supabase
    .from("fees")
    .select("id, sort_order")
    .filter("sort_order", direction === "up" ? "lt" : "gt", current.sort_order)
    .order("sort_order", { ascending: direction !== "up" })
    .limit(1)
    .maybeSingle<{ id: string; sort_order: number }>();

  // Already at the end it was asked to move towards.
  if (!neighbour) return;

  /*
   * Two updates, not an upsert of two partial rows: an upsert builds an INSERT
   * first and `fees.title` is NOT NULL, so it would be rejected before the
   * conflict clause ever ran.
   *
   * They are not in one transaction. If the second fails the two rows share a
   * `sort_order`, which is untidy but not broken — nothing depends on the
   * values being distinct, the list still renders, and moving the fee again
   * fixes it. Failing loudly and leaving it recoverable beats holding a
   * transaction open for a reorder.
   */
  const [{ error: firstError }, { error: secondError }] = await Promise.all([
    supabase
      .from("fees")
      .update({ sort_order: neighbour.sort_order })
      .eq("id", current.id),
    supabase
      .from("fees")
      .update({ sort_order: current.sort_order })
      .eq("id", neighbour.id),
  ]);

  if (firstError || secondError) {
    console.error(
      `[cms] Failed to reorder fee ${id}`,
      firstError ?? secondError,
    );

    return;
  }

  revalidateFor("fees");
}

export async function deleteFee(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");

  if (typeof id !== "string") return;

  const supabase = await createClient();

  const { error } = await supabase.from("fees").delete().eq("id", id);

  if (error) {
    console.error(`[cms] Failed to delete fee ${id}`, error);

    return;
  }

  revalidateFor("fees");
  redirect("/admin/fees");
}
