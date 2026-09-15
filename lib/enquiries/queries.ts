import "server-only";

import {
  enquirySelect,
  enquiryStatuses,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/enquiries/schema";
import { createClient } from "@/utils/supabase/server";

/**
 * Admin-side reads for the enquiry inbox.
 *
 * These go through the cookie-backed client, not the secret key, so the
 * "Admins can read enquiries" policy is what actually authorises them. A
 * non-admin session returns no rows rather than an error — which is why the
 * pages using these also sit behind `requireAdmin()`.
 *
 * Kept apart from `admin-actions.ts` on purpose: a file marked `"use server"`
 * publishes every export as a callable endpoint, and reads have no business
 * being one.
 */

export type EnquiryFilter = EnquiryStatus | "all";

/** Newest first. Capped — pagination arrives when the volume asks for it. */
const listLimit = 200;

export async function listEnquiries(
  filter: EnquiryFilter = "all",
): Promise<Enquiry[]> {
  const supabase = await createClient();

  let query = supabase
    .from("enquiries")
    .select(enquirySelect)
    .order("created_at", { ascending: false })
    .limit(listLimit);

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error } = await query.returns<Enquiry[]>();

  if (error) {
    console.error("Failed to list enquiries", error);

    return [];
  }

  return data ?? [];
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .select(enquirySelect)
    .eq("id", id)
    .maybeSingle<Enquiry>();

  if (error) {
    console.error(`Failed to load enquiry ${id}`, error);

    return null;
  }

  return data;
}

export type EnquiryCounts = Record<EnquiryFilter, number>;

/**
 * Counts for the filter tabs and the sidebar badge. Head-only requests, so
 * Postgres counts against the status index without returning any rows.
 */
export async function countEnquiries(): Promise<EnquiryCounts> {
  const supabase = await createClient();

  const results = await Promise.all(
    enquiryStatuses.map(async (status) => {
      const { count } = await supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", status);

      return [status, count ?? 0] as const;
    }),
  );

  const counts = Object.fromEntries(results) as Record<EnquiryStatus, number>;

  return {
    ...counts,
    all: results.reduce((total, [, count]) => total + count, 0),
  };
}

/** Just the unactioned count, for the sidebar badge. */
export async function countNewEnquiries(): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return count ?? 0;
}
