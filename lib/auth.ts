import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function hasAdminRole(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return !error && data?.role === "admin";
}

export const getAdminSession = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (
    error ||
    !claims?.sub ||
    !(await hasAdminRole(supabase, claims.sub))
  ) {
    return null;
  }

  return {
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
});

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) redirect("/auth");

  return session;
}
