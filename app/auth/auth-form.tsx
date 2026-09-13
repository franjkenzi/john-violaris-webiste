"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, LockKeyhole, UserPlus } from "lucide-react";

import {
  signIn,
  signUp,
  type AuthActionState,
} from "@/app/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "sign-in" | "sign-up";

const initialState: AuthActionState = { error: null, success: false };

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");

  return (
    <Card className="w-full max-w-sm border-navy/10 shadow-xl shadow-navy/8">
      <CardHeader className="gap-4 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-navy text-gold">
          {mode === "sign-in" ? (
            <LockKeyhole className="size-5" aria-hidden="true" />
          ) : (
            <UserPlus className="size-5" aria-hidden="true" />
          )}
        </div>
        <div>
          <CardTitle className="font-display text-2xl text-navy">
            {mode === "sign-in" ? "Admin sign in" : "Request admin access"}
          </CardTitle>
          <CardDescription className="mt-1.5">
            {mode === "sign-in"
              ? "Sign in to manage the John Violaris website."
              : "Create an account to request access to the dashboard."}
          </CardDescription>
        </div>
        <div
          className="grid grid-cols-2 rounded-lg bg-muted p-1"
          role="group"
          aria-label="Choose authentication view"
        >
          <Button
            type="button"
            size="sm"
            variant={mode === "sign-in" ? "default" : "ghost"}
            aria-pressed={mode === "sign-in"}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "sign-up" ? "default" : "ghost"}
            aria-pressed={mode === "sign-up"}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {mode === "sign-in" ? (
          <SignInForm key="sign-in" />
        ) : (
          <SignUpForm key="sign-up" onBackToSignIn={() => setMode("sign-in")} />
        )}
      </CardContent>
    </Card>
  );
}

function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <EmailField id="sign-in-email" disabled={pending} autoFocus />
      <PasswordField
        id="sign-in-password"
        autoComplete="current-password"
        disabled={pending}
      />
      <ActionError message={state.error} />
      <Button className="h-10 w-full" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm({ onBackToSignIn }: { onBackToSignIn: () => void }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.success) {
    return (
      <div className="space-y-5 text-center" aria-live="polite">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl text-navy">
            Thanks for signing up
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This dashboard is only for approved administrators. If you are one
            of them, your access will be enabled soon.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Please check your inbox if you are asked to confirm your email
            address.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBackToSignIn}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <EmailField id="sign-up-email" disabled={pending} autoFocus />
      <PasswordField
        id="sign-up-password"
        autoComplete="new-password"
        disabled={pending}
        helpText="Use at least 8 characters."
      />
      <PasswordField
        id="confirm-password"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        disabled={pending}
      />
      <ActionError message={state.error} />
      <Button className="h-10 w-full" type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}

function EmailField({
  id,
  disabled,
  autoFocus,
}: {
  id: string;
  disabled: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Email address</Label>
      <Input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        required
        autoFocus={autoFocus}
        disabled={disabled}
      />
    </div>
  );
}

function PasswordField({
  id,
  name = "password",
  label = "Password",
  autoComplete,
  disabled,
  helpText,
}: {
  id: string;
  name?: string;
  label?: string;
  autoComplete: "current-password" | "new-password";
  disabled: boolean;
  helpText?: string;
}) {
  const helpId = helpText ? `${id}-help` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        minLength={name === "password" && autoComplete === "new-password" ? 8 : undefined}
        aria-describedby={helpId}
        required
        disabled={disabled}
      />
      {helpText ? (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}

function ActionError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
