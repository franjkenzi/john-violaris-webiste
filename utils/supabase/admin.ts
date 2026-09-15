import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client authenticated with the project's secret key.
 *
 * This client BYPASSES row level security. Only use it where a request has no
 * signed-in user but a write still has to happen — currently just the public
 * enquiry submission, whose table grants nothing to `anon` on purpose.
 *
 * Anything an admin does goes through `utils/supabase/server.ts` instead, so
 * their own RLS policies stay the authority on what they can see and change.
 *
 * No session is persisted: each call is a one-shot server request.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not configured for server-side writes. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
