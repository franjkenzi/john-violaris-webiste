import "server-only";

import { Resend } from "resend";

import { siteConfig } from "@/lib/site-config";

/**
 * Resend setup.
 *
 * Every value is environment-driven and every one has a working default, so the
 * application builds and the enquiry form saves submissions before John's
 * sending domain is verified. `getResend()` returning null is a supported
 * state, not an error: the caller records that no email was sent and carries on.
 */

let client: Resend | null = null;

/** The configured client, or null when no API key is set. */
export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) return null;

  client ??= new Resend(apiKey);

  return client;
}

export const emailConfig = {
  /**
   * Sending identity. Must be an address on a domain verified in Resend —
   * until John's domain is verified, Resend's shared `onboarding@resend.dev`
   * sender works for testing but can only deliver to the account owner.
   */
  from:
    process.env.ENQUIRY_FROM_EMAIL ||
    `${siteConfig.name} <onboarding@resend.dev>`,

  /** Where enquiry notifications land. */
  notificationTo:
    process.env.ENQUIRY_NOTIFICATION_EMAIL || siteConfig.contact.email,
} as const;

/** Escapes interpolated values before they go into an HTML email body. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escapes, then turns newlines into `<br />` for free-text fields. */
export function escapeHtmlWithBreaks(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}
