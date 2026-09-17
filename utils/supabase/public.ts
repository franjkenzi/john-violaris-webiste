import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for public, unauthenticated content reads.
 *
 * Distinct from `server.ts` for one reason: that client reads `cookies()`, and
 * a page that touches `cookies()` cannot be statically rendered. Every public
 * page on this site is static, and none of them care who is asking — they show
 * published content to everyone. Reading through this client keeps them static.
 *
 * It carries the publishable key, so RLS remains the authority: the content
 * tables grant `select` to `anon` behind `using (published)` policies, which
 * means an unpublished draft is invisible here even if a query asks for it.
 *
 * Never use this for anything a signed-in admin does — drafts included. That is
 * `server.ts`, whose session is what the admin policies test.
 *
 * The client is created once per module load rather than per call: it holds no
 * session and no per-request state, so there is nothing to leak between
 * requests and nothing to rebuild.
 */
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured for public reads. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createSupabaseClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let client: ReturnType<typeof createPublicClient> | null = null;

export function publicClient() {
  client ??= createPublicClient();

  return client;
}
