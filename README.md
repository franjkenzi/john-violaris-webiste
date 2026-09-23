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
- Editable page copy: the hero, section headings, process steps, FAQ and the
  rest of the core-page wording, managed at `/admin/website-content`.
- A CMS-managed fee schedule at `/admin/fees`, with drafts, reordering and
  fees that appear in the table but get no card.
- Site settings at `/admin/site-settings`: name, contact details, the booking
  link and the SRA number, with the built-in value shown as each field’s
  placeholder.
- A read-only view of the imported ReviewSolicitors reviews, with no edit path,
  so an independently collected review stays one.
- Page-specific titles, descriptions and canonical URLs; existing homepage structured data.
- Consultation links route to the contact page until a real booking URL is configured.

## Content and configuration

`lib/site-config.ts` holds the shape, the defaults and the navigation; the
values are edited under Site Settings (see below). The environment variables
below remain the defaults, used until a setting is given a value:

| Variable                      | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_PHONE_NUMBER`    | Confirmed E.164 telephone number   |
| `NEXT_PUBLIC_PHONE_DISPLAY`   | Human-readable telephone number    |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number, any usual format  |
| `NEXT_PUBLIC_BOOKING_URL`     | Confirmed TidyCal consultation URL |
| `NEXT_PUBLIC_APP_VERSION`     | Build identifier for stale-tab detection (see below). Only needed where the deploy exposes neither a Vercel deployment id nor a git checkout. |

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

WhatsApp is click-to-chat only, per PRD §8 — no Business API. `whatsappHref()`
in `lib/site-config.ts` returns `null` unless a usable number is configured, so
every view omits the route entirely rather than offering a "WhatsApp" control
that leads somewhere else. Set the number in whatever shape it is supplied
(`+44 7700 900123`, `07700 900123`, `447700900123`): it is normalised to the
digits `wa.me` expects, and a value that cannot be read as a phone number is
treated as unset rather than rendered as a broken link.

Chats opened from a service page prefill the offence — "Hello John, I’d like
to speak to you about Drink Driving." — so a message arrives already saying
what it concerns. Every other entry point opens an empty chat: nothing puts
words in the visitor’s mouth unless the page genuinely knows what the matter
is, and no prefill ever describes a case more broadly than the page it came
from.

Phone links still fall back to the contact page when unset and no fabricated
number is dialled. Note that the contact page does currently render the
`phoneDisplay` placeholder as though it were a number; that belongs with the
telephone work rather than the WhatsApp integration. The contact page
explains the outstanding preview details.
Confirm the existing email address (`contact@johnviolaris.com`) before launch.
Set the verified SRA number in central configuration when supplied.

## The CMS content layer

`lib/cms/` is the path between the Supabase content tables and the site. The
blog, the page copy, the fee schedule, the site settings, the service catalogue,
the offence pages and every public route's SEO metadata are served through it.
Sections were migrated one at a time.

| Module            | Role                                                          |
| ----------------- | ------------------------------------------------------------- |
| `types.ts`        | What goes in each table's `content` jsonb column               |
| `seed-data.ts`    | Today's static content, expressed as rows                      |
| `mappers.ts`      | Row → the shape the components already render                  |
| `queries.ts`      | Public reads (anon, no cookies, published rows only)           |
| `admin-queries.ts`| Admin reads (cookie session, drafts included)                  |
| `write.ts`        | The one wrapper every mutation goes through                    |
| `revalidate.ts`   | Which routes to rebuild after a change                         |
| `form.ts`         | Shared form state and validation for the admin forms           |
| `sections/`       | The editable page copy — registry, values, save action         |
| `fees/`           | The fee schedule — field rules and mutations                   |
| `services/`       | The service catalogue — field rules and mutations              |
| `service-pages/`  | The offence pages — field rules and mutations                  |
| `seo/`            | Route registry, metadata resolution, SEO overrides             |
| `settings/`       | Site settings — the editable field list and its save action    |

Public reads go through `utils/supabase/public.ts` — the publishable key and no
cookies, because a page that reads `cookies()` cannot be statically rendered and
every public page here is static. RLS is what limits those reads to published
rows, rather than a `.eq("published", true)` a later refactor could drop.

A read falls back to the static seed when Supabase **errors**, and never when it
simply returns no rows. An empty answer is the truthful one — nothing is
published — and treating it as a failure would make it impossible for John to
unpublish the last testimonial. Fallbacks log loudly.

Writes call `revalidatePath` through `revalidateFor()`. Not `revalidateTag`:
tagging non-`fetch` reads needs either `unstable_cache`, deprecated in Next 16,
or the Cache Components model, which changes rendering for the entire app.
Because the header carries the services menu and the footer the contact details,
a change to either really does invalidate every page, and the map says so.

### The seed

`supabase/migrations/*_seed_cms_content.sql` loads the current static content
into the tables, so switching a section to the CMS changes nothing a visitor
sees. It is generated, not written:

```bash
npm run cms:verify
```

```bash
npm run cms:seed
```

`cms:verify` puts every seeded row through the same mapper the site uses and
compares the result against the static module rendered today; `cms:seed`
regenerates the migration in place. Run the verifier after editing anything in
`lib/content/` or `lib/cms/` — a failure means a page would change when it
switched over.

Every statement in the seed is guarded by `where not exists (select 1 from
<table>)`, so applying it to a database that already holds content does nothing.
That guard is not politeness: a seed that overwrote on conflict would delete
John's edits the next time anyone reset the database.

The scripts run under plain `node` with `scripts/alias-hook.mjs`, which teaches
it the `@/*` path alias so the generator can import exactly what the app imports.

`lib/content/services.ts`, `service-descriptions.ts` and `service-detail.ts`
are now the seed and the fallback for the service catalogue and the offence
pages, as `blog.ts` and `fees.ts` are for theirs. Check all professional claims,
statute references and marketing copy with John before publication. The older
`lib/content/home.ts` retains previous draft content for reference; its placeholder
reviews and career history are not rendered by the redesigned pages.

## The blog

The blog is the first section served from the CMS. `/blog` and `/blog/[slug]`
read from Supabase; `lib/content/blog.ts` is now only the seed and the fallback.

Admin routes:

| Route                     | What it does                                      |
| ------------------------- | ------------------------------------------------- |
| `/admin/blog-posts`       | Every article, drafts included; publish in one click |
| `/admin/blog-posts/new`   | Write a new one                                   |
| `/admin/blog-posts/[id]`  | Edit, publish, delete                             |
| `/admin/blog-categories`  | Add, rename and remove categories                 |

An article body is a list of **sections** — a heading, paragraphs, and an
optional bulleted list — not markdown or HTML. That is the shape the article
page already renders and the shape its "on this page" rail is built from, so the
CMS stores structure and the page keeps its own typography. Sections can be
added, reordered and removed in the editor.

Drafts are invisible to visitors: the `blog_posts` read policy is
`using (published)`, so an unpublished article is not merely hidden by the UI —
it is not readable with the publishable key at all. Publishing an article for
the first time dates it; unpublishing keeps that date, so republishing later
does not present an old article as new. Deleting a category leaves its articles
published without one, and the admin says so before you confirm.

Articles prerender at build time, and `dynamicParams` is left at its default so
an article published after a deploy renders on first request instead of 404ing
until the next build.

### Images

`blog-images` is a public Supabase Storage bucket: public read, admin-only
write, 5 MB per file, JPEG/PNG/WebP/AVIF only, enforced both on the bucket and
in `uploadBlogImage` so a rejection is a sentence rather than an error code.
Filenames are generated rather than taken from the upload.

An image is uploaded as soon as it is chosen, not on save, so the editor
previews the real stored object. Alt text is required whenever an image is set.
The article page renders the image only when one exists, so the six existing
articles look exactly as they did. `next.config.ts` derives the allowed image
host from `NEXT_PUBLIC_SUPABASE_URL` rather than hardcoding the project ref.

## Website content

The editorial copy on the core pages — the hero, the section headings, the
standfirsts, the process steps, the FAQ — is editable at
`/admin/website-content`. It is the second section served from the CMS, after
the blog.

Three files carry it:

| File                          | Role                                                  |
| ----------------------------- | ----------------------------------------------------- |
| `lib/content/pages.ts`        | The copy as written: the default, and the fallback     |
| `lib/cms/sections/schema.ts`  | Which sections are editable and what fields each has   |
| `lib/cms/sections/values.ts`  | Stored data ↔ form text, shared by editor and action   |

The registry is the whole feature. A section is a list of fields, the copy
those fields hold by default, and the routes it renders on, so the editor, the
action that receives it and the revalidation after a save are all written once
against that description. Making another piece of copy editable is an entry in
`schema.ts` and a prop on the component — not a new form, a new action or a
migration.

### No seed, and why

Unlike the other content tables, `page_sections` is not seeded and has no
`published` column. A section John has never edited simply has no row, and the
read falls back to `lib/content/pages.ts`. That keeps the defaults the single
definition of what a section says out of the box: nothing in the database is a
copy of them, so nothing can drift from them, and "revert to original" is a
`delete` rather than a write of today's wording.

It also means the third rule in `lib/cms/queries.ts` — fall back on failure,
never on emptiness — reads differently here, deliberately. Elsewhere no rows is
a truthful answer that must be rendered: nothing is published. Here there is no
publish flag, so no row means nobody has edited the section, not that it is
hidden.

### Line breaks

Several headings break at a chosen point — "Your defence…" above "My personal
attention." — and that break is a design decision, not the browser wrapping
text. Those fields are stored as a list of lines and rendered by `Lines` in
`components/ui/lines.tsx`. An editor types lines; nobody types markup. Prose
fields are lists too, but of paragraphs, split on blank lines rather than
single ones, for the same reason `readParagraphs` gives.

### Sections on more than one page

Four sections appear on two routes — Meet John on `/` and `/about`, the police
station feature on `/` and `/police-station`, the questions on `/` and `/fees`,
the process on `/` and `/about`. Each is edited in one place, under the page it
belongs to, and every page that renders it reads it from there. `appearsOn` in
the registry is what the editor shows and what the save revalidates, so the
routes a change reaches are declared once rather than remembered.

The closing call to action is the exception that proves it: `appearsOn: ["*"]`,
because it really is in the body of every page, and it revalidates `("/",
"layout")` rather than a hand-written list that would be wrong the next time a
route is added. The article and offence pages pass their own heading to it,
which stays with those sections rather than here.

## Fees

The fee schedule is managed at `/admin/fees`: add, edit, reorder, publish and
unpublish. `FeesSchedule` reads it through `getFees()`, and
`lib/content/fees.ts` is now the seed and the fallback.

`price` is text and optional, and both matter. Text because real entries read
"£400", "£750 / £1,100" or "From £X" — a numeric column would force every one
of those into a shape it does not have and then the page would have to put the
shape back. Optional because a fee whose figure is not settled should be
publishable as "On enquiry" rather than held back or given an invented number;
`toFee` supplies that wording, and the admin list prints the same thing so the
list and the site never disagree.

`content.tableOnly` marks a fee that belongs in the full table but gets no card
of its own. There is one: the adjourned-hearing fee, which is an add-on to an
instruction rather than a way to instruct John, so a card offering it beside
the six real ones would misrepresent what it is. It used to live outside the
CMS entirely, as `additionalDraftFee` in `lib/content/fees.ts`, which made it
the one figure on the page no admin screen could reach;
`20260922160000_add_adjourned_hearing_fee.sql` gives it a row.

Reordering swaps two rows' `sort_order` rather than renumbering the list, so
the gaps the seed left between them survive. The two updates are not in one
transaction: a half-applied swap leaves two rows sharing a `sort_order`, which
is untidy but not broken — nothing depends on the values being distinct and
moving the fee again fixes it.

The headings, the table caption and the notes beneath the schedule are page
copy, edited under Website Content. That includes the note saying the figures
are still to be confirmed, which is the point: taking it down is part of
launching, so it has to be something John can delete rather than a paragraph
in a component.

## Site settings

`lib/site-config.ts` is still where every phone number, address, email and
external URL comes from — but it now holds the *shape and the defaults* rather
than the values. `/admin/site-settings` edits the values.

The split inside that file is the thing to understand:

- **`SiteSettings`** is what John can edit: his name, role, monogram,
  jurisdiction, email, both forms of the telephone number, the WhatsApp number,
  the booking link, the response promise and the SRA number. The defaults are
  still read from the environment, so an existing deploy keeps working exactly
  as it did until someone edits a setting; a stored value simply wins over one.
- **`deployment`** is configuration, not content: the canonical domain, the
  secondary domain and the dialling code. The canonical domain decides
  `metadataBase` and every canonical URL on the site, and changing it from a
  browser would detach them from the domain actually serving the page. An
  earlier seed put those three in `site_settings`;
  `20260923103000_drop_deployment_site_settings.sql` takes them back out,
  because a row that looks authoritative and is ignored is worse than no row.

`resolveSiteConfig` lays stored values over the defaults and derives `telHref`,
`mailtoHref`, `bookingHref` and the normalised WhatsApp digits. Only non-empty
values override: clearing a field in the admin deletes its row, which is what
makes "leave it blank to fall back" true rather than a figure of speech.

### Reaching the components

Server components read it with `getSiteConfig()`. Client components — the
masthead, the services menu, the docked contact bar, the hero and the enquiry
form, all of which need scroll listeners, focus traps or `useActionState` —
take it from `useSiteConfig()`, which the site layout provides after reading it
once.

`SiteConfig` is plain data for exactly that reason: a function cannot be
serialised across the server/client boundary, so `whatsappHref(config, subject)`
is a standalone function taking the config rather than a method on it.

Two places deliberately use `fallbackSiteConfig` instead: `app/error.tsx` and
`app/not-found.tsx`. An error boundary whose branding needs a database read is
an error boundary that fails when the read is what broke.

The enquiry emails read the live settings at send time rather than a snapshot
taken when the module loaded, so an enquiry arriving an hour after John changes
his telephone number quotes the new one.

## Services and offence pages

Two admin sections, one per table.

**`/admin/services`** is the catalogue: the name, the menu group, the icon, the
reference line under the name, the card summary, and whether the service sits
in the rail of common charges beneath the hero. It drives the services
mega-menu, the services explorer on the home and services pages, the footer's
services column and that rail. The site layout reads the catalogue once and
hands it to those client components through `ServiceCatalogueProvider`, the
same arrangement as `SiteConfigProvider`; the footer takes it as a prop.

- **The slug is fixed once a service exists.** `/services/<slug>` is the offence
  page's address, and articles store it as their related service, the main
  navigation links to one by hand, and search engines have the rest.
- **Position is not a field.** The arrows move a service within its group; a
  service added to a group, or moved to another, goes to the end of it; a new
  group appears at the end of the menu. Groups sit where their first member
  does, so a raw number would let one service drag its whole group to the top.
- **Police station representation** links to its own page (`content.href`).
  The save carries that link over, and it has no offence page to write.
- The group named in `representationGroup` (`lib/content/services.ts`) is
  treated as general crime on its pages: no statute sentence, no request for a
  driving record. Renaming it in the CMS would change that, and the editor says
  so beside the field.

**`/admin/service-pages`** is the long-form page for each service: the heading
and standfirst, up to three at-a-glance cards, the points examined, and the
optional outcomes and ancillary-orders tables. The repeating groups use the
same `ItemsField` and `readItems` as Website Content. A page is addressed by
its service, and the first save creates it.

- A draft saves with only a heading. Publishing — from the editor or from the
  list — needs the rest, so a half-written page cannot go live.
- A published service with no published page still resolves, with the general
  copy it always had, rather than 404ing from a link the menu printed.
- `process` is stored on every page but no page renders it, so it has no field;
  the save carries it over. The copy every offence page shares — "Clarity
  first", the checklist, the contact card — is template text, not editable
  here.

`20260923140000_sync_magistrates_court_page.sql` brought the Magistrates Court
page in the database up to the site's wording before the switch. It had been
rewritten in `lib/content/service-detail.ts` after it was seeded, and nothing
noticed while the pages still rendered from the file.

## SEO metadata

`/admin/seo-metadata` lists every public route — the fixed pages, each
published offence page and each published article — with what it shows in
Google, and edits an override for any of them: search title and description,
share title, description and image, a canonical, and "hide from search".

Three modules in `lib/cms/seo/`, and the split is the design:

- **`routes.ts`** is the route registry: every public route and what it says by
  default — its heading and standfirst, "*Offence* Solicitor", an article's
  headline, excerpt and featured image. The SEO admin, each route's
  `generateMetadata` and `app/sitemap.ts` all read it, so a route cannot be in
  the sitemap without being editable, or the other way round. The save action
  also refuses any path not on it.
- **`resolve.ts`** decides the order (SEO requirement REQ-009): the root layout,
  then the route's defaults, then the override. It is pure, and `npm run
  seo:verify` tests the cases the requirement names.
- **`metadata.ts`** is what the routes call: `seoMetadataFor(path)`.

Things that are easy to get wrong here:

- **Next merges metadata shallowly.** A route that sets any `openGraph` field
  replaces the root layout's whole `openGraph`, site name and locale included,
  so the resolver always builds it whole. Before this, articles shipped without
  `og:site_name`, and every page's `og:url` was the home page.
- **Titles.** An override is the part before " | John Violaris"; the template
  adds the rest. A page shares its full title, an article its headline alone —
  as Next produced before routes set `openGraph` themselves.
- **Streaming metadata.** In development, and for any route rendered on
  request, Next 16 may stream the tags into `<body>` for ordinary browsers. It
  keeps them in `<head>` for crawlers that cannot run JavaScript, WhatsApp and
  Facebook included (`htmlLimitedBots`). The public pages are prerendered, so
  their tags are in `<head>` for everyone.
- **Overrides are keyed by path.** Renaming an article moves its override;
  deleting an article or a service removes it (`lib/cms/seo/overrides.ts`).
- An override with nothing left in it is deleted, not stored empty, so
  "customised" means "has a row". "Reset to defaults" is a second submit button
  of the editor form, so its result returns through the editor's own state and
  the fields empty themselves.

`app/sitemap.ts` builds `/sitemap.xml` from the registry, leaving out any route
hidden from search or canonical to another address. Only routes backed by a row
carry `lastmod`. `app/robots.ts` allows everything public and disallows
`/admin`, `/auth` and `/api`.

### Only the canonical host is indexed

`proxy.ts` sends `X-Robots-Tag: noindex, nofollow` on every response whose
`Host` is not `johnviolaris.com` — the `vercel.app` address that serves as
staging, preview deployments, `www`, and `localhost` — and on `/admin` and
`/auth` on every host (REQ-035). Per request, because the pages are static and
the same HTML is served on every host; from the `Host` header rather than
`request.nextUrl`, which carries the server's own hostname locally. Until
johnviolaris.com points at Vercel, nothing the new site serves is indexable,
which is intended: the domain still serves the old site.

### The default share card

`/share-image` (`app/share-image/route.tsx`) is the card a shared link shows
when its page has no image of its own: navy and gold, John's name and role from
Site Settings, and the hero portrait. The resolver uses it last, after an
override's image and an article's featured image.

- **A route, not an `opengraph-image` file.** File-based metadata outranks
  `generateMetadata`, so a root `opengraph-image` would replace every page's
  own share image and every featured image.
- **JPEG, about 60 KB.** `ImageResponse` renders PNG, and with a photograph in
  it that is most of a megabyte; WhatsApp is widely reported to drop preview
  images much over 300 KB. `sharp` re-encodes it.
- **Built at deploy, rebuilt on a Site Settings save** (`force-static`, and
  `site-settings` revalidates `/share-image`).
- **The fonts are the site's own, as TTF,** in `assets/fonts/` —
  `ImageResponse` cannot read the WOFF2 `next/font` serves. OFL-licensed; see
  the README there.
- **Every file path it reads is written out whole.** A path built from a
  variable makes the bundler trace the entire project, `public/` included, into
  the function. `outputFileTracingIncludes` in `next.config.ts` names the same
  files for the rebuild on the server.

## Reviews

The reviews at `/admin/testimonials` are read only, and that is the point.
Every one was left by a client on ReviewSolicitors and collected by them; the
site presents them as independently verified, which is true only while nobody
on this side can alter the wording. So there is no edit form — correcting a
review means taking it up with ReviewSolicitors.

The page exists because "what is the site showing?" is a fair question that
should not be answered by reading the public page. The copy framing the
section — the heading, the button, the note — is ordinary page content and is
editable under Website Content.

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

## Deploys and stale tabs

A tab left open across a deploy keeps running the previous build. Its chunks may
no longer be served, its prefetched routes no longer match, and the enquiry
form's server action carries an id the new server does not recognise — failures
that are silent and baffling from the visitor's side.

Two things address it. `deploymentId` in `next.config.ts` turns on Next's own
skew protection, so assets are deployment-keyed and a mismatched navigation
becomes a full page load rather than a broken one. `VersionGuard`, mounted in
the root layout, polls `/api/version` while the tab is in the foreground and,
when the server reports a different build, shows a branded notice asking for a
refresh. `app/error.tsx` and `app/global-error.tsx` make the same request when a
stale chunk fails outright.

The notice can be dismissed, and nothing reloads on its own: someone part-way
through the enquiry form should not lose what they have written. The build
identifier is resolved once, at build time, from `NEXT_PUBLIC_APP_VERSION`, then
Vercel's `VERCEL_DEPLOYMENT_ID` or `VERCEL_GIT_COMMIT_SHA`, then `GIT_SHA`, then
the commit SHA of the checkout. If none resolve, the value is `dev` and the
check is switched off rather than guessing at an identifier that could differ
between the build and the running server.

Rebuilding from a dirty tree produces the same commit SHA as the previous build,
so set `NEXT_PUBLIC_APP_VERSION` explicitly if you deploy uncommitted work.

## Scope still outstanding

This is the public frontend, enquiry capture, a CMS-managed blog and editable
page copy — not the complete production system in `prd.md`.

Every admin section is built. From `seo_requirements.md`, still open:
structured data beyond the home page's (REQ-010–019), per-page generated
share cards (the optional half of REQ-024), the redirect table and host/case
redirects (REQ-025–030), and the SEO health checks and draft preview in the
editor (REQ-048, REQ-052).

One part of the fees page is still static: the three-stage scope comparison in
`FeesMatrix`, which reads `feeStages`, `feeInclusions` and `stageIncludes` from
`lib/content/fees.ts`. Only its heading is editable. Making the stages editable
means the stage key stops being a union type and `stageIncludes` stops being a
lookup against a fixed order, so it is a change to the component rather than
another registry entry.

Analytics, Search Console, the remaining Schema.org types, domain
configuration and production launch remain separate work
after that.

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
