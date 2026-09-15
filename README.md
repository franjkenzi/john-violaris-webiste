# John Violaris — Criminal Defence Solicitor

Next.js 16 App Router, React 19, TypeScript and Tailwind CSS v4.

```bash
npm run dev
npm run build
npm run lint
```

## Current implementation

An editorial redesign using the exact reference HTML navy, gold and warm whites, with large
serif typography and a typographic JV identity. The design intentionally works
without stock portraits or invented client reviews.

- Homepage with personal introduction, experience statistics, service explorer,
  police station feature, process, expandable FAQs, fees preview and consultation CTA.
- A persistent route to John on every page: a slim contact rail above the masthead
  from 640px up, and a docked action bar below 1280px that appears once the hero
  has been scrolled past. Both render only the routes that are configured.
- Footer contact facts (email, telephone when set, response time, coverage) and a
  plain-language note on the contact page that getting in touch is not instructing.
- Original all-services mega-menu retained, including mouse hover, click,
  keyboard activation, Escape dismissal and inert closed content. Available from
  640px upward; smaller screens reach the catalogue through the mobile navigation.
- Mobile navigation with scroll lock, focus trapping, Escape/close controls and
  automatic dismissal on navigation or resizing to desktop.
- About, Services, Police Station, Fees, Contact and Useful Information pages.
- Fifteen service pages generated from a shared template and the service catalogue.
- Full draft fee schedule carried over from the supplied reference, visibly marked
  for confirmation before publication.
- A working enquiry form on the contact page: server-side validation with
  field-level errors, a honeypot and a per-address rate limit, storage in
  Supabase, and Resend notification and confirmation emails.
- An admin enquiry inbox at `/admin/enquiries` with status filters, a detail
  view, reply and call actions, email delivery state and permanent deletion for
  erasure requests.
- Expanded professional background, police-station guidance, service evidence
  checklists, sentencing summaries and fee guidance.
- Six complete legal-guide article pages based on the reference index cards.
- Page-specific titles, descriptions and canonical URLs; existing homepage structured data.
- Consultation links route to the contact page until a real booking URL is configured.

## Content and configuration

`lib/site-config.ts` holds shared contact, booking, domain and navigation settings.
Optional public environment variables (read at build time):

| Variable                      | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_PHONE_NUMBER`    | Confirmed E.164 telephone number   |
| `NEXT_PUBLIC_PHONE_DISPLAY`   | Human-readable telephone number    |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | International digits for WhatsApp  |
| `NEXT_PUBLIC_BOOKING_URL`     | Confirmed TidyCal consultation URL |

Server-side variables. These are never sent to the browser and must not be
prefixed with `NEXT_PUBLIC_`:

| Variable                     | Required | Purpose                                                                                     |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `SUPABASE_SECRET_KEY`        | Yes      | Supabase secret (`service_role`) key. The enquiry form cannot store a submission without it.  |
| `RESEND_API_KEY`             | Yes      | Resend API key. Without it enquiries are still stored, but no email is sent.                  |
| `ENQUIRY_FROM_EMAIL`         | Yes      | Sending identity, e.g. `John Violaris <enquiries@johnviolaris.com>`. Domain must be verified in Resend. |
| `ENQUIRY_NOTIFICATION_EMAIL` | No       | Where enquiry notifications land. Defaults to the address in `lib/site-config.ts`.            |
| `ENQUIRY_IP_SALT`            | No       | Random string salting the hashed address used for rate limiting. Set one in production.       |

Until `ENQUIRY_FROM_EMAIL` points at a verified domain, Resend's shared
`onboarding@resend.dev` sender is used, which can only deliver to the Resend
account owner — enough for testing, not for launch.

Phone and WhatsApp links fall back to the contact page when unset; no fabricated
number is dialled, and no view renders the placeholder string as if it were a
number — the label changes instead ("Speak to John", "Urgent? Contact John"). The contact page explains the outstanding preview details.
Confirm the existing email address (`contact@johnviolaris.com`) before launch.
Set the verified SRA number in central configuration when supplied.

`lib/content/services.ts` remains the service catalogue. Concise service summaries
live in `lib/content/service-descriptions.ts`. Check all professional claims,
statute references and marketing copy with John before publication. The older
`lib/content/home.ts` retains previous draft content for reference; its placeholder
reviews and career history are not rendered by the redesigned pages.

## Enquiries

An enquiry is written to `public.enquiries` first, and the visitor is told it
arrived as soon as that succeeds. Both emails are sent afterwards, through
`after()`, so a Resend outage costs a notification but never the enquiry. What
was and was not delivered is recorded on the row and shown in the inbox.

The table grants nothing to `anon`, so it cannot be reached from the browser
with the publishable key at all. Submissions go through the server action in
`lib/enquiries/actions.ts` using the secret key, which keeps validation, the
honeypot and the rate limit on the only path into the table. Admin reads and
status changes use the ordinary cookie-backed client, so RLS stays the authority
on those.

Rows hold a named person's account of an allegation against them. Treat them as
sensitive: the inbox is admin-only, no enquiry is ever rendered on the public
site, and deletion from the detail page is how an erasure request is honoured.

## Scope still outstanding

This is the public frontend plus enquiry capture, not the complete production
system in `prd.md`. The CMS sections behind `/admin` are still placeholders, and
a managed blog, analytics, sitemap/robots, domain configuration and production
launch remain separate work.

The existing Next.js/Vercel architecture is retained. No deployment or changes to
external services are part of this local redesign.

## Design and accessibility

Shared styling lives in `app/globals.css`; reusable editorial page intros live in
`components/pages/page-intro.tsx`. Components default to server rendering except
navigation and the interactive service explorer. The explorer uses accessible
tabs with arrow, Home and End keys. FAQs use native `details`/`summary` controls.
The layout includes visible focus states and reduced-motion support.

Responsive checks cover 375px, 768px, 1024px and 1440px. The mobile hero reflows the
monogram card into a compact layout; service cards become a single column and
sticky service contact panels return to normal flow.
