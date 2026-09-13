"use server";

import { redirect } from "next/navigation";

import { hasAdminRole } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export type LoginState = {
  error: string | null;
};

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Enter your email address and password." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { error: "Enter your email address and password." };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { error: "The email address or password is incorrect." };
    }

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !hasAdminRole(claimsData?.claims)) {
      await supabase.auth.signOut({ scope: "local" });
      return { error: "This account is not authorised to access the CMS." };
    }
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }

  redirect("/admin");
}
