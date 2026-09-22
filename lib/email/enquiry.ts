import "server-only";

import { getSiteConfig } from "@/lib/cms/queries";
import {
  emailConfigFor,
  escapeHtml,
  escapeHtmlWithBreaks,
  getResend,
} from "@/lib/email/client";
import { enquiryFullName, type Enquiry } from "@/lib/enquiries/schema";
import { formatUkDateTime } from "@/lib/format";
import type { SiteConfig } from "@/lib/site-config";

/**
 * The two enquiry emails (PRD §7): a notification to John carrying the enquiry,
 * and a confirmation to the visitor acknowledging receipt.
 *
 * Neither promises an outcome, and the confirmation states plainly that
 * enquiring is not instructing (PRD §25).
 *
 * Both are sent after the visitor already has their success screen, so a send
 * failure never costs the enquiry — it is recorded on the row instead and
 * surfaced in the admin inbox.
 */

const navy = "#0d1b2a";
const gold = "#c9a84c";
const cream = "#fafaf8";
const line = "#e4e2dd";
const body = "#252525";
const muted = "#7a808f";

export type EnquiryEmailOutcome = {
  adminNotifiedAt: string | null;
  visitorConfirmedAt: string | null;
  error: string | null;
};

/** Shared shell: centred column, serif masthead, small print footer. */
function wrap(config: SiteConfig, heading: string, content: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:24px 12px;background:${cream};color:${body};font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${line};">
    <div style="padding:20px 28px;background:${navy};color:${cream};">
      <div style="font-size:19px;letter-spacing:-0.3px;">${escapeHtml(config.name)}<span style="color:${gold};">.</span></div>
      <div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(250,250,248,0.62);">${escapeHtml(config.role)}</div>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 18px;font-size:22px;font-weight:400;line-height:1.3;color:${navy};">${escapeHtml(heading)}</h1>
      ${content}
    </div>
  </div>
  <div style="max-width:560px;margin:14px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${muted};text-align:center;">
    ${escapeHtml(config.name)} — ${escapeHtml(config.roleLong)}, ${escapeHtml(config.jurisdiction)}
  </div>
</body>
</html>`;
}

/** Label/value rows used for the enquiry details in both emails. */
function detailRows(rows: { label: string; value: string }[]) {
  return rows
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid ${line};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${navy};vertical-align:top;width:38%;">${escapeHtml(label)}</td>
        <td style="padding:9px 0 9px 14px;border-bottom:1px solid ${line};font-size:15px;color:${body};vertical-align:top;">${escapeHtmlWithBreaks(value)}</td>
      </tr>`,
    )
    .join("");
}

function detailTable(rows: { label: string; value: string }[]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 22px;">${detailRows(rows)}</table>`;
}

/** The enquiry as plain label/value lines, for the text part and the summary. */
function detailLines(rows: { label: string; value: string }[]) {
  return rows.map(({ label, value }) => `${label}: ${value}`).join("\n");
}

function enquiryDetails(enquiry: Enquiry) {
  const rows = [
    { label: "Name", value: enquiryFullName(enquiry) },
    { label: "Telephone", value: enquiry.phone },
    { label: "Email", value: enquiry.email },
    { label: "Type of matter", value: enquiry.matter_type },
  ];

  if (enquiry.court_date) {
    rows.push({ label: "Court / interview date", value: enquiry.court_date });
  }
  if (enquiry.court_location) {
    rows.push({ label: "Court / police station", value: enquiry.court_location });
  }

  rows.push({ label: "Description", value: enquiry.description });

  return rows;
}

// ---------------------------------------------------------------------------
// Notification to John
// ---------------------------------------------------------------------------

function adminEmail(config: SiteConfig, enquiry: Enquiry, adminUrl: string) {
  const rows = enquiryDetails(enquiry);
  const name = enquiryFullName(enquiry);
  const received = formatUkDateTime(enquiry.created_at);

  const subject = `New enquiry — ${enquiry.matter_type} — ${name}`;

  const html = wrap(
    config,
    "A new enquiry has come in.",
    `
    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${muted};">Received ${escapeHtml(received)}. Reply to this email to answer ${escapeHtml(name)} directly.</p>
    ${detailTable(rows)}
    <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:13px 22px;background:${navy};color:${cream};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;text-decoration:none;">Open in the dashboard</a>
    <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${muted};">This enquiry is stored in the website dashboard whether or not this email arrives.</p>`,
  );

  const text = [
    `A new enquiry has come in.`,
    ``,
    `Received ${received}. Reply to this email to answer ${name} directly.`,
    ``,
    detailLines(rows),
    ``,
    `Open in the dashboard: ${adminUrl}`,
  ].join("\n");

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Confirmation to the visitor
// ---------------------------------------------------------------------------

/**
 * Deliberately careful wording. It confirms receipt, sets expectations, points
 * urgent matters at the telephone, and makes clear that nothing has been agreed.
 */
function visitorEmail(config: SiteConfig, enquiry: Enquiry) {
  const rows = enquiryDetails(enquiry);
  const hasPhone = Boolean(config.phoneE164);

  const urgentText = hasPhone
    ? `If your matter is urgent — a court hearing tomorrow, or a police interview today — please call ${config.phoneDisplay} rather than wait for a reply to this email.`
    : `If your matter is urgent — a court hearing tomorrow, or a police interview today — please use the direct contact details on ${config.url} rather than wait for a reply to this email.`;

  const disclaimer = `Sending an enquiry does not create a solicitor–client relationship. No such relationship exists until John has confirmed that he is able to act and the terms of business are agreed. Please do not send confidential details of your case until then.`;

  const subject = `We have received your enquiry — ${config.name}`;

  const html = wrap(
    config,
    "Thank you — your enquiry has arrived.",
    `
    <p style="margin:0 0 16px;">Dear ${escapeHtml(enquiry.first_name)},</p>
    <p style="margin:0 0 16px;">Thank you for getting in touch. Your enquiry has reached John Violaris and he will read it himself — enquiries are not handled by a call centre or passed to junior staff.</p>
    <p style="margin:0 0 16px;">John will come back to you directly to discuss your situation and what the available options are. ${escapeHtml(config.responseTime)}.</p>
    <div style="margin:0 0 22px;padding:14px 16px;background:#f5edd6;border-left:3px solid ${gold};">
      <p style="margin:0;font-size:14px;line-height:1.7;">${escapeHtml(urgentText)}</p>
    </div>
    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${navy};">A copy of what you sent</p>
    ${detailTable(rows)}
    <p style="margin:0;padding-left:12px;border-left:2px solid ${line};font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${muted};">${escapeHtml(disclaimer)}</p>`,
  );

  const text = [
    `Dear ${enquiry.first_name},`,
    ``,
    `Thank you for getting in touch. Your enquiry has reached John Violaris and he will read it himself — enquiries are not handled by a call centre or passed to junior staff.`,
    ``,
    `John will come back to you directly to discuss your situation and what the available options are. ${config.responseTime}.`,
    ``,
    urgentText,
    ``,
    `A copy of what you sent`,
    `----------------------`,
    detailLines(rows),
    ``,
    disclaimer,
  ].join("\n");

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Unknown error";
}

/**
 * Sends both emails. Never throws: the outcome describes what got through, and
 * the caller writes it back to the enquiry row.
 *
 * The two sends are independent — a bounced confirmation must not stop John's
 * notification, and vice versa.
 */
export async function sendEnquiryEmails(
  enquiry: Enquiry,
  adminUrl: string,
): Promise<EnquiryEmailOutcome> {
  const resend = getResend();

  if (!resend) {
    return {
      adminNotifiedAt: null,
      visitorConfirmedAt: null,
      error: "RESEND_API_KEY is not set — no emails were sent.",
    };
  }

  /*
   * The live settings, not a snapshot taken when the module loaded. An enquiry
   * arriving an hour after John changes his telephone number should quote the
   * new one, and the address the notification goes to falls back to the
   * contact email, which is now a setting too.
   */
  const config = await getSiteConfig();
  const emailConfig = emailConfigFor(config);

  const admin = adminEmail(config, enquiry, adminUrl);
  const visitor = visitorEmail(config, enquiry);

  const [adminResult, visitorResult] = await Promise.allSettled([
    resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.notificationTo,
      replyTo: enquiry.email,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
    }),
    resend.emails.send({
      from: emailConfig.from,
      to: enquiry.email,
      replyTo: emailConfig.notificationTo,
      subject: visitor.subject,
      html: visitor.html,
      text: visitor.text,
    }),
  ]);

  const errors: string[] = [];
  const now = new Date().toISOString();

  // Resend resolves with `{ data, error }` rather than rejecting, so both the
  // rejection and the returned error have to be checked.
  let adminNotifiedAt: string | null = null;
  if (adminResult.status === "rejected") {
    errors.push(`Notification: ${describeError(adminResult.reason)}`);
  } else if (adminResult.value.error) {
    errors.push(`Notification: ${adminResult.value.error.message}`);
  } else {
    adminNotifiedAt = now;
  }

  let visitorConfirmedAt: string | null = null;
  if (visitorResult.status === "rejected") {
    errors.push(`Confirmation: ${describeError(visitorResult.reason)}`);
  } else if (visitorResult.value.error) {
    errors.push(`Confirmation: ${visitorResult.value.error.message}`);
  } else {
    visitorConfirmedAt = now;
  }

  return {
    adminNotifiedAt,
    visitorConfirmedAt,
    error: errors.length > 0 ? errors.join(" · ") : null,
  };
}
