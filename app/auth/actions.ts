"use server";

import { redirect } from "next/navigation";

import { hasAdminRole } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export type AuthActionState = {
  error: string | null;
  success: boolean;
};

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut({ scope: "local" });
  redirect("/auth");
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Enter your email address and password.", success: false };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { error: "Enter your email address and password.", success: false };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return {
        error: "The email address or password is incorrect.",
        success: false,
      };
    }

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (
      claimsError ||
      !userId ||
      !(await hasAdminRole(supabase, userId))
    ) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        error: "This account is not authorised to access the CMS.",
        success: false,
      };
    }
  } catch {
    return {
      error: "Sign-in is temporarily unavailable. Please try again.",
      success: false,
    };
  }

  redirect("/admin");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "Complete all fields to sign up.", success: false };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password || !confirmPassword) {
    return { error: "Complete all fields to sign up.", success: false };
  }

  if (password.length < 8) {
    return {
      error: "Choose a password with at least 8 characters.",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return { error: "The passwords do not match.", success: false };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return {
        error: "We couldn't create the account. Please try again shortly.",
        success: false,
      };
    }

    if (data.session) {
      await supabase.auth.signOut({ scope: "local" });
    }

    return { error: null, success: true };
  } catch {
    return {
      error: "Sign-up is temporarily unavailable. Please try again.",
      success: false,
    };
  }
}
