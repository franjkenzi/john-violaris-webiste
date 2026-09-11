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
- A complete contact-form preview with all planned fields; it is intentionally
  non-submitting until the delivery workflow is connected.
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

## Scope still outstanding

This is the complete public frontend represented by the supplied HTML, not the
complete production system in `prd.md`. Supabase CMS/authentication, Resend
delivery for the preview contact form, a managed blog, analytics, sitemap/robots,
domain configuration and production launch remain separate work. Until delivery
is connected, the contact form is disabled and clearly states that it does not
submit or store information.

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
