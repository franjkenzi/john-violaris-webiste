import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/utils/supabase/server";

type Claims = Record<string, unknown>;

export function hasAdminRole(claims: Claims | null | undefined) {
  if (!claims) return false;

  const appMetadata = claims.app_metadata;
  const appMetadataRole =
    typeof appMetadata === "object" && appMetadata !== null && "role" in appMetadata
      ? appMetadata.role
      : undefined;

  return appMetadataRole === "admin" || claims.user_role === "admin";
}

export const getAdminSession = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims || !hasAdminRole(claims)) return null;

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
