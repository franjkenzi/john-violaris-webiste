import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth";
import {
  describeDatabaseError,
  formFailure,
  formSuccess,
  type CmsFormState,
} from "@/lib/cms/form";
import { revalidateFor, type ContentEntity } from "@/lib/cms/revalidate";
import { createClient } from "@/utils/supabase/server";

/**
 * The write half of the CMS, in one wrapper.
 *
 * Every content mutation does the same five things in the same order: confirm
 * the caller is an admin, get a client, run the statement, rebuild the affected
 * routes, hand a form state back to `useActionState`. Doing that once here is
 * what keeps a new section down to its query and its field list.
 *
 * Two authorisation checks stand behind each write and both are deliberate.
 * `requireAdmin()` runs because a Server Action is a public POST endpoint
 * whatever page rendered the form. The table's RLS policies run because the
 * check that actually counts is the one the database makes — which is why this
 * uses the cookie-backed client rather than the secret key that would bypass
 * them.
 */

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type CmsWriteOptions<F extends string, T> = {
  entity: ContentEntity;
  /** Echoed back into the form, so a failed save keeps what was typed. */
  values: Record<F, string>;
  /** Shown above the form after a successful save. */
  successMessage: string;
  /**
   * Public routes this particular row appears on, beyond the fixed ones in
   * `revalidate.ts` — the article's own URL, the offence page's own URL.
   *
   * A function when the paths depend on what the statement returned, which is
   * how a newly inserted row contributes its own slug. On a rename, include the
   * previous path too: the old URL stays cached and serving otherwise.
   */
  paths?: string[] | ((result: T) => string[]);
  run: (
    supabase: SupabaseServerClient,
  ) => Promise<{ data: T; error: PostgrestError | null }>;
};

/**
 * What a write hands back: the form state, plus whatever the statement
 * returned.
 *
 * `data` is how a caller learns the id of a row it just created. It travels to
 * the client inside the `useActionState` state, so a caller should select the
 * columns it actually needs rather than `*` — this is not the place to discover
 * that a whole row went along for the ride.
 */
export type CmsWriteResult<F extends string, T> = CmsFormState<F> & {
  data: T | null;
};

/**
 * Run a content mutation and return the resulting form state.
 *
 * Note what this does not do: redirect. A section that should navigate after
 * saving — creating a post, then editing it — does that from the caller, using
 * the `data` this returns. `redirect()` throws to unwind, so calling it in here
 * would mean throwing through the wrapper that exists to catch things.
 */
export async function cmsWrite<F extends string, T = unknown>({
  entity,
  values,
  successMessage,
  paths,
  run,
}: CmsWriteOptions<F, T>): Promise<CmsWriteResult<F, T>> {
  await requireAdmin();

  let result: { data: T; error: PostgrestError | null };

  try {
    result = await run(await createClient());
  } catch (error) {
    // A thrown error here is the connection failing, not a rejected statement.
    console.error(`[cms] ${entity} write threw`, error);

    return {
      ...formFailure(
        values,
        "The database could not be reached. Nothing was saved — try again in a moment.",
      ),
      data: null,
    };
  }

  if (result.error) {
    console.error(`[cms] ${entity} write failed`, result.error);

    return { ...formFailure(values, describeDatabaseError(result.error)), data: null };
  }

  revalidateFor(
    entity,
    typeof paths === "function" ? paths(result.data) : (paths ?? []),
  );

  return { ...formSuccess(values, successMessage), data: result.data };
}
