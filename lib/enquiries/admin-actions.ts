"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { isEnquiryStatus } from "@/lib/enquiries/schema";
import { createClient } from "@/utils/supabase/server";

/**
 * Inbox mutations.
 *
 * Both checked twice over: `requireAdmin()` because a Server Action is a public
 * POST endpoint whatever page rendered the form, and the table's RLS policies
 * because the check that counts is the one the database makes.
 */

/**
 * Called straight from the status buttons inside a transition, rather than as a
 * form action: the button paints the new state optimistically and this catches
 * up behind it. Arguments are still treated as untrusted — a Server Action is a
 * public POST endpoint whatever calls it.
 */
export async function updateEnquiryStatus(id: string, status: string) {
  await requireAdmin();

  if (typeof id !== "string" || !isEnquiryStatus(status)) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(`Failed to update enquiry ${id}`, error);

    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
}

/**
 * Permanent deletion — the only way to honour an erasure request, since an
 * enquiry holds a named person's account of an allegation against them.
 */
export async function deleteEnquiry(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");

  if (typeof id !== "string") return;

  const supabase = await createClient();

  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) {
    console.error(`Failed to delete enquiry ${id}`, error);

    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  redirect("/admin/enquiries");
}
