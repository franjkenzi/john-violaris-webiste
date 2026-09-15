# SEO & Technical Requirements

**John Violaris — Criminal Defence Solicitor**

_johnviolaris.com | Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Supabase · Vercel_

---

## 0. How to use this document

This is the reference specification for the site's SEO foundation. It is a **companion to `prd.md`**, not a replacement — where the PRD says _what_ the site does, this says _what the SEO layer must guarantee_ and _how you verify it_.

It is written to be picked up cold, months from now, when SEO work actually begins. Each requirement has an ID, a priority, the fields it needs, and acceptance criteria you can test against.

### Priority key

| Level  | Meaning                                                                       |
| ------ | ----------------------------------------------------------------------------- |
| **P0** | Blocks launch. The site should not go live to search engines without it.      |
| **P1** | Ship within the first month. Real ranking or operational cost if missing.     |
| **P2** | Valuable, schedule deliberately. Not a launch blocker.                        |
| **P3** | Build the seam now, fill it later. Cheap to accommodate, expensive to retrofit. |

### Decisions already taken

These were settled before this document was written. They are assumptions baked into every requirement below — if one changes, re-read the sections it touches.

| Decision             | Choice                                                                                                                   | Affects |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------- |
| **Canonical domain** | `johnviolaris.com` serves everything. `drivingjustice.co.uk` 301-redirects path-for-path. One brand, one index.            | §4      |
| **Location pages**   | Architecture built from day one, **zero pages published at launch**. Avoids a re-architecture when SEO starts.             | §7      |
| **Business address** | Unknown. Schema emits address/geo/hours **only when populated in the CMS**, omits them cleanly otherwise. Never invented.  | §2      |
| **Analytics**        | GA4 direct + Search Console, with UK consent handling. GTM specified as an optional swap-in. No call-tracking vendor.      | §10     |

### Current implementation state (as of 2026-09-14)

An honest snapshot, so nobody re-specifies work that exists or assumes work that doesn't.

**Already in place**

- `metadataBase`, title template, default description, default Open Graph and `robots` defaults — `app/layout.tsx`
- Per-route `generateMetadata` with titles, descriptions and `alternates.canonical` — `app/(site)/[page]/page.tsx`, `app/(site)/services/[slug]/page.tsx`, `app/(site)/blog/[slug]/page.tsx`
- A single `LegalService` JSON-LD block on the homepage — `app/(site)/page.tsx:23`
- Central configuration for contact details, domains and navigation — `lib/site-config.ts`
- Custom 404 — `app/not-found.tsx`
- `next/font` with `display: "swap"` for all three faces — `app/layout.tsx`
- Skip-to-content link and a `<main id="main">` landmark — `app/(site)/layout.tsx`
- CMS tables including a path-keyed `seo_metadata` table — `supabase/migrations/20260914103000_create_cms_content_tables.sql`
- Admin gate (`profiles.role = 'admin'`, `private.is_admin()`) — same migration

**Not yet built**

- `app/sitemap.ts`, `app/robots.ts` — neither file exists
- Any redirect handling. `proxy.ts` currently only refreshes the Supabase session; `drivingjustice.co.uk` is unconnected
- Schema beyond the single homepage block — no `Person`, no `Service`, no `BreadcrumbList`, no `BlogPosting`
- Any CMS-driven metadata: all copy still lives in `lib/content/*` as hardcoded TypeScript
- Analytics, consent banner, any `dataLayer`
- Image housekeeping: `public/John Violaris 2.png` is a 9.2MB unreferenced file sitting in the public directory, and served filenames contain spaces (REQ-021)

> **Note on Next.js 16.** This project runs Next 16.3.4, where `middleware.ts` has been renamed to **`proxy.ts`** (the file already exists and exports `proxy()`). Sitemaps and robots use the `app/sitemap.ts` / `app/robots.ts` file conventions returning `MetadataRoute.Sitemap` / `MetadataRoute.Robots`. Verify API details in `node_modules/next/dist/docs/` before writing code — per `AGENTS.md`, this version differs from older App Router material.

---

## 1. Per-page editable meta fields

Every indexable route must expose a complete, CMS-editable metadata set that overrides code defaults without a deploy. The `seo_metadata` table already exists for this, keyed by site path (`/services/drink-driving`) with a `content` jsonb payload — these requirements define what goes in that payload.

### REQ-001 — Editable meta title per route

**P0**

Each route has an editable meta title populating `<title>`.

**Fields**

- `metaTitle` — string, 1–70 chars
- Site-level fallback template already exists in `app/layout.tsx`: `%s | John Violaris`

**Acceptance criteria**

- Editing the field in the CMS and saving updates `<title>` with no code deploy.
- An empty field falls back to the code-defined title for that route, then to the site template. It never renders empty.
- The CMS shows a live character count, warning above 60 characters.
- The title is present in the **server-rendered HTML** — verifiable with `curl`, not just DevTools.

**Note.** Practice-area titles should lead with the offence, because that is the query. "Drink Driving Solicitor | John Violaris" outperforms "John Violaris | Drink Driving".

### REQ-002 — Editable meta description per route

**P0**

**Fields**

- `metaDescription` — string, 1–160 chars

**Acceptance criteria**

- Editing in the CMS updates `<meta name="description">` with no deploy.
- Character count shown, warning above 155.
- Present in server-rendered HTML.
- The CMS flags duplicate descriptions across routes on save (REQ-052).

**Note.** Descriptions for offence pages should carry both the reassurance and the action — the free consultation, and that you deal directly with John. This is the copy that decides the click for an anxious searcher.

### REQ-003 — H1 editable separately from meta title

**P0**

The visible `<h1>` and the `<title>` serve different readers and must be independently editable. "Facing a drink driving charge?" is a good H1 and a poor title tag.

**Fields**

- `h1Heading` — string, 1–80 chars
- `metaTitle` — separate, per REQ-001

**Acceptance criteria**

- Every page renders exactly one `<h1>`.
- `<h1>` content comes from `h1Heading`, not `metaTitle`.
- Subordinate headings use `<h2>`/`<h3>`/`<h4>` in correct nesting order, with no skipped levels.
- An automated check fails the build if any route renders zero or multiple `<h1>` elements.

### REQ-004 — Editable URL slug

**P0**

**Fields**

- `slug` — lowercase, hyphen-separated, ASCII, unique within parent path

**Acceptance criteria**

- Validates against `^[a-z0-9]+(-[a-z0-9]+)*$`.
- A duplicate slug within the same parent path is rejected with a clear error.
- Changing a published slug automatically writes a 301 into the redirect table (REQ-030).
- The CMS warns before changing the slug of a page that has organic traffic.

**Note.** The existing slugs (`/services/drink-driving`, `/services/totting-up`) are good. Resist deepening the hierarchy — `/services/drink-driving` beats `/motoring/offences/drink-driving` for both crawlers and humans.

### REQ-005 — Canonical URL per route

**P0**

Raised from the usual P1 because two domains point at this site. Every page must state unambiguously which URL is the real one.

**Fields**

- `canonicalUrl` — optional absolute URL. Defaults to the page's own absolute URL on the canonical host.

**Acceptance criteria**

- Every indexable page renders `<link rel="canonical">` in `<head>`.
- The default is self-referencing, absolute, on `https://johnviolaris.com`.
- A page served under `drivingjustice.co.uk` — should it ever render rather than redirect — still canonicalises to `johnviolaris.com`.
- Query-parameter variants (`?utm_source=...`) canonicalise to the clean URL.
- An explicit override is respected when set.

### REQ-006 — Per-page robots directives

**P1**

**Fields**

- `robotsIndex` — boolean, default `true`
- `robotsFollow` — boolean, default `true`

**Acceptance criteria**

- The page renders `<meta name="robots">` reflecting the values.
- Default behaviour is `index, follow`.
- `robotsIndex: false` also removes the page from the sitemap (REQ-032) in the same publish cycle.
- Admin, auth and preview routes are `noindex` regardless of field state (REQ-035).

### REQ-007 — Open Graph fields per page

**P1**

These control how a link looks when John sends it in WhatsApp — which, given WhatsApp is a primary contact channel here, makes this a conversion surface rather than a vanity feature.

**Fields**

- `ogTitle` — defaults to `metaTitle`
- `ogDescription` — defaults to `metaDescription`
- `ogImage` — image upload, 1200×630
- `ogType` — `website` | `article`, default `website`

**Acceptance criteria**

- Page renders `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale` (`en_GB`).
- An empty `ogImage` falls back to a site-level default image.
- Upload warns if the image is smaller than 1200×630.
- Rendering verified in the WhatsApp, LinkedIn and iMessage previews before launch.

### REQ-008 — Twitter / X card fields

**P2**

**Fields**

- `twitterCard` — `summary` | `summary_large_image`, default `summary_large_image`
- `twitterTitle`, `twitterDescription`, `twitterImage` — all optional, defaulting to the OG values

**Acceptance criteria**

- Renders `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- Falls back cleanly to OG values when unset.

### REQ-009 — Defined metadata resolution order

**P0**

With three layers able to set the same tag — the root layout, the route's `generateMetadata`, and the CMS `seo_metadata` row — precedence must be explicit and tested, or debugging a wrong title becomes guesswork.

**Required order, lowest to highest**

1. Root defaults in `app/layout.tsx` (`metadataBase`, title template, default description, default OG)
2. Route-level `generateMetadata` (the current hardcoded values)
3. CMS `seo_metadata` row matched on exact path
4. Explicit per-entity overrides (a blog post's own SEO tab)

**Acceptance criteria**

- A single documented helper resolves metadata for every route. No route assembles its own precedence logic.
- An empty string in a CMS field is treated as "unset" and falls through; it never renders an empty tag.
- Unit tests cover: all layers set; only root set; CMS set but blank; CMS row absent.
- `metadataBase` remains set so all relative URLs resolve absolute.

---

## 2. Structured data (Schema.org / JSON-LD)

Structured data is what lets Google and AI search surfaces understand that this site represents **a named, qualified, regulated individual practising a specific area of law across England and Wales**. For a personal-brand legal practice, entity clarity is the highest-leverage technical work on the site.

All schema is emitted as JSON-LD in `<script type="application/ld+json">`. No microdata, no RDFa.

> **Set expectations honestly.** Two things older SEO playbooks get wrong. FAQ rich results were restricted in August 2023 to well-known government and health sites, so FAQ markup will not put dropdowns in your search result. And review stars for a business on its own website are "self-serving" under Google's guidelines and are not eligible for rich results. Both markups remain worth emitting — for entity understanding and AI-search citation — just not for the stars.

### REQ-010 — Site-wide LegalService schema, CMS-driven

**P0**

Every page carries a schema block describing the practice, generated from one CMS record so there is a single source of truth. The homepage already has a hand-written `LegalService` block at `app/(site)/page.tsx:23` — that becomes the template, moved behind the CMS.

**Fields (all from a single Business Information record)**

- `name`, `legalName` — string
- `description` — string
- `telephone`, `email` — single source of truth, matching `lib/site-config.ts`
- `url`, `logo`, `image` — absolute URLs
- `areaServed` — array, default `["England", "Wales"]`
- `priceRange` — optional string
- `sameAs` — array of profile URLs (Law Society Find a Solicitor, ReviewSolicitors, LinkedIn, Trustpilot, Google Business Profile)
- `address` — **optional.** A `PostalAddress` is emitted only when every sub-field is populated
- `geo` — **optional.** Emitted only alongside a populated address
- `openingHours` — **optional**
- `hasCredential` / `identifier` — SRA number, emitted only once confirmed

**Acceptance criteria**

- Validates clean on the Google Rich Results Test and the Schema.org validator.
- **Unpopulated optional fields are omitted entirely** — never emitted as empty strings, placeholder text, or `null`. An address that does not exist must not appear as an empty `PostalAddress`.
- Every `sameAs` URL resolves to a live profile. No speculative URLs.
- Editing the CMS record updates schema across all pages with no deploy.
- The schema's `telephone` is byte-identical to what `lib/site-config.ts` renders in `tel:` links.

**Type choice.** Use `LegalService` as the primary type. Add `Attorney` as an additional type only if John is presented as an individual practitioner rather than a firm — read REQ-061 before deciding, because this interacts with how the site describes its regulatory status.

### REQ-011 — Person schema for John

**P0**

The site is a personal brand. Google needs to resolve "John Violaris" as an entity with credentials. This is the E-E-A-T backbone for legal content, and the thing that earns citation in AI search answers.

**Fields**

- `name`, `jobTitle`, `description`
- `image` — professional portrait, absolute URL
- `worksFor` / `memberOf` — linked to the LegalService node by `@id`
- `knowsAbout` — array of practice areas
- `alumniOf` — only if confirmed
- `hasCredential` — an `EducationalOccupationalCredential` for the solicitor qualification, with year admitted
- `sameAs` — Law Society Find a Solicitor profile, LinkedIn, review profiles

**Acceptance criteria**

- `Person` schema renders on the About page and the homepage.
- Linked by `@id` to the `LegalService` node rather than duplicated inline.
- Every credential is verified against source before publication — nothing inferred (PRD §25).
- Author bylines on blog posts reference this same `@id` (REQ-015).

### REQ-012 — Service schema on each service page

**P0**

Fifteen service pages exist. Each should declare what it offers and who provides it.

**Fields**

- `name` — service name
- `serviceType` — controlled vocabulary per offence
- `description`
- `provider` — `@id` reference to the LegalService node
- `areaServed` — inherits from the business record, overridable per service
- `offers` — optional, only when a confirmed fixed fee exists

**Acceptance criteria**

- Every `/services/[slug]` page emits `Service` schema alongside the site-wide block.
- `provider` references the LegalService `@id` rather than restating the business.
- Validates on the Rich Results Test.
- No `offers` block is emitted for a service without a confirmed published price.

### REQ-013 — FAQPage schema for FAQ blocks

**P1**

The homepage already uses `details`/`summary` FAQs. Where a page has genuine question-and-answer content, emit `FAQPage`.

**Fields**

- `faqItems` — array of `{ question: string, answer: richtext }`, CMS-managed and reorderable

**Acceptance criteria**

- A page with an FAQ block emits `FAQPage` schema whose `mainEntity` matches the visible questions **exactly**. Markup must never contain questions the visitor cannot see.
- Only one `FAQPage` block per page.
- Validates on the Rich Results Test.
- The CMS documents that this aids AI-search comprehension but will not produce SERP dropdowns.

### REQ-014 — BreadcrumbList on all non-home pages

**P1**

Breadcrumb markup does still produce visible SERP breadcrumbs, making it one of the few markups here with direct display value. The blog and service templates already render visible breadcrumbs — the markup must mirror them.

**Acceptance criteria**

- Every non-home page emits `BreadcrumbList`.
- Each item has `position`, `name`, `item` (absolute URL).
- The markup matches the visible breadcrumb trail exactly.
- Service pages: Home → Services → [Service]. Blog: Home → Useful Information → [Article].

### REQ-015 — BlogPosting schema on articles

**P1**

Raised from the reference document's P2: for legal content, author and freshness signals carry real weight.

**Fields**

- `headline`, `description`, `image`
- `author` — `@id` reference to the `Person` node (REQ-011)
- `publisher` — `@id` reference to the LegalService node
- `datePublished` — ISO 8601
- `dateModified` — ISO 8601, auto-updated on save
- `mainEntityOfPage`

**Acceptance criteria**

- Every `/blog/[slug]` emits `BlogPosting`.
- `dateModified` updates automatically on content save, never by hand.
- `author` resolves to the Person entity, not a bare string.
- A visible "Last reviewed" date renders on the page, matching `dateModified`.

### REQ-016 — Review and AggregateRating schema

**P2**

Deliberately **not** P0. Google does not show rich-result stars for a business's own self-hosted reviews, so the value here is entity signal, not SERP stars.

**Fields**

- `individualReviews` — `{ author, reviewRating, datePublished, reviewBody, source }`
- `aggregateRatingValue`, `aggregateReviewCount` — only where derived from a real, countable review set

**Acceptance criteria**

- `Review` schema is emitted for genuine testimonials held in the `testimonials` table.
- `AggregateRating` is emitted **only** when backed by a verifiable count from a named platform (ReviewSolicitors, Trustpilot, Google). Never a hand-typed average.
- No review is marked up that is not displayed on the page.
- Zero fabricated reviews (PRD §25, and a professional-conduct issue — see REQ-065).
- If reviews arrive via a third-party widget, do not duplicate them in markup; let the platform's own indexing carry them.

### REQ-017 — Entity graph with stable `@id` references

**P1**

Rather than repeating business details in every block, publish one connected graph. This is what makes the entity legible to AI search systems.

**Acceptance criteria**

- Stable `@id` URIs, e.g. `https://johnviolaris.com/#practice`, `https://johnviolaris.com/#john`, `https://johnviolaris.com/#website`.
- `WebSite` and `WebPage` nodes present, with `WebPage` linked to its `isPartOf` `WebSite` and `about` the relevant entity.
- Page-level blocks reference these `@id`s instead of restating name, phone and address.
- `@id` values never change once published — they are permanent identifiers.

### REQ-018 — Per-page custom JSON-LD escape hatch

**P2**

**Fields**

- `customJsonLd` — raw JSON, validated on save

**Acceptance criteria**

- Valid JSON-LD pasted in the CMS renders in addition to generated schema.
- Invalid JSON is rejected on save with a clear parse error.
- The field is admin-only.

### REQ-019 — Schema validation gate before publication

**P1**

Broken schema is invisible until traffic is already lost. Catch it at publish.

**Acceptance criteria**

- A script validates every route's JSON-LD against the Schema.org vocabulary, runnable locally and in CI.
- Publishing content that produces invalid schema shows a warning in the CMS.
- Pre-launch: every page type is manually checked against the Google Rich Results Test, with results recorded in the launch checklist (§13).

---

## 3. Images, alt text and media

There is no portfolio gallery here — the image set is small and deliberate: John's portrait, service imagery, blog featured images. That makes the requirements lighter than a photo-heavy site, but the portrait is the LCP element on most pages, so it carries real performance weight.

### REQ-020 — Editable alt text on every image

**P0**

**Fields**

- `altText` — string, required unless `isDecorative` is true
- `isDecorative` — boolean. When true, renders `alt=""`

**Acceptance criteria**

- Every `<img>` on the site has an `alt` attribute.
- Alt text is editable per image in the CMS, no deploy required.
- Save validation fires when `altText` is empty and `isDecorative` is false.
- Decorative images render `alt=""`, not a missing attribute and not filler text.

**Note.** For John's portrait, alt text should describe the person, not stuff keywords: "John Violaris, criminal defence solicitor" — not "best drink driving solicitor London motoring lawyer".

### REQ-021 — All images through `next/image` with explicit dimensions

**P0**

The hero already does this correctly — `components/sections/hero.tsx:124` renders `next/image` with `fill`, a proper `sizes` attribute, descriptive alt text and `preload`. The requirement is to hold that standard everywhere, and to clear the housekeeping around it.

**Acceptance criteria**

- Every content image renders through `next/image`. `components/ui/portrait.tsx` still renders a deliberate placeholder and must be converted when John's photographs arrive.
- All images carry explicit `width` and `height`, or `fill` with a sized container, so no layout shift occurs.
- **`preload`, not `priority`.** Next 16 deprecated `priority` in favour of `preload`; the hero already uses the new prop. Note that the Next docs recommend `loading="eager"` or `fetchPriority="high"` over `preload` in most cases — worth measuring which performs better for the hero portrait.
- Below-the-fold images lazy-load by default.
- AVIF and WebP are negotiated automatically. Configure `images.formats` in `next.config.ts`, which is currently empty.
- **Served filenames are URL-safe lowercase.** `/John Violaris 1.JPG` percent-encodes to `/John%20Violaris%201.JPG` in every request, canonical tag and OG tag. Rename to `john-violaris-portrait.jpg` before launch, while nothing external links to it.
- **Delete `public/John Violaris 2.png`** — 9.2MB, referenced nowhere in the codebase, and publicly fetchable from the deployed site. If a version of it is needed, compress it and serve it through `next/image`.
- Lighthouse reports zero CLS attributable to images.

### REQ-022 — Descriptive filenames on CMS upload

**P1**

Supabase Storage generates opaque keys by default. Image filenames are a small but free ranking signal, and they matter for image search on offence-related queries.

**Fields**

- `filename` — string, becomes the last segment of the served URL

**Acceptance criteria**

- The operator can set or rename the served filename at upload.
- Filenames validate as lowercase, hyphenated, ASCII, no spaces.
- Renaming an image already referenced in published content either updates the references or leaves a redirect — it must never produce a broken image.

### REQ-023 — Image title and caption

**P3**

**Fields**

- `title` — optional, populates the `title` attribute
- `caption` — optional rich text, rendered below the image when set

**Acceptance criteria**

- Both fields are editable in the CMS.
- The caption renders visibly when populated and is absent when empty.

### REQ-024 — Open Graph image fallback

**P2**

**Acceptance criteria**

- Pages with no uploaded `ogImage` fall back to a site-level default.
- Optionally, generate a branded 1200×630 card per page using `next/og` with the page title on the navy/gold identity.
- Generated cards are cached at the edge, not regenerated per request.

---

## 4. Domains, URLs and redirects

The decision is settled: **`johnviolaris.com` is canonical, `drivingjustice.co.uk` redirects to it.** One index, one set of signals, no duplicate-content ambiguity. This section specifies how that is enforced.

### REQ-025 — Single canonical host

**P0**

**Acceptance criteria**

- `drivingjustice.co.uk/{path}` → 301 → `https://johnviolaris.com/{path}`, preserving path and query string.
- `www.drivingjustice.co.uk/{path}` redirects identically.
- Redirect is configured at the **Vercel domain level**, not in application code, so it costs no function invocation. A host check in `proxy.ts` serves only as a backstop.
- Both `johnviolaris.com` and `www.johnviolaris.com` resolve; the non-preferred variant 301s to the preferred one. Pick one and record it here: **_[decide at launch: apex or www]_**.
- All HTTP requests 301 to HTTPS (Vercel handles this automatically once the domain is attached).
- `drivingjustice.co.uk` is verified in Search Console as a separate property so the redirect can be monitored.

**Note (308 vs 301).** Vercel issues 308 for permanent redirects. Google treats 308 and 301 identically for canonicalisation, so either is fine — do not spend time forcing 301.

### REQ-026 — Legacy URL inventory before switchover

**P1**

If `drivingjustice.co.uk` has ever been live and indexed, its existing URLs carry accumulated signals. Redirecting the whole domain to the homepage throws that away.

**Acceptance criteria**

- Before DNS switchover, inventory every indexed URL on the old domain (Search Console coverage report, `site:` search, existing sitemap, server logs if available).
- Each legacy URL is mapped to its closest equivalent on the new site, one by one.
- Blanket redirects to `/` are used only where no relevant equivalent exists.
- The mapping is recorded in the redirect table (REQ-029), not hardcoded.
- If the domain has no history, record that finding here and skip the rest.

### REQ-027 — Trailing slash policy

**P1**

**Acceptance criteria**

- Policy chosen and documented: **no trailing slash** (Next.js default, matches the current site's internal links).
- The opposite variant 301s to the canonical variant.
- Every internal link, sitemap entry and canonical tag uses the no-slash form consistently.

### REQ-028 — Lowercase URL enforcement

**P1**

**Acceptance criteria**

- Requests containing uppercase path characters 301 to the lowercase equivalent.
- All internal links are lowercase.
- Enforced in `proxy.ts`, before route resolution.

### REQ-029 — CMS-managed redirect table

**P1**

John should be able to retire or rename a page without a developer.

**Fields**

- `redirects` — collection of `{ source, destination, type: 301 | 302, notes, created_at }`

**Acceptance criteria**

- Redirects are stored in Supabase and manageable from the admin UI.
- Applied in `proxy.ts` at the edge, never client-side.
- Redirect loops are rejected on save.
- Chains are detected and flattened (A→B→C collapses to A→C).
- Lookup is cached, so the table does not add a database round-trip to every request.
- A new redirect takes effect within 60 seconds without a deploy.

**Implementation note.** `proxy.ts` currently calls `updateSession` for Supabase auth. Redirect handling must run **before** session refresh — a redirected request should never pay for a session lookup — and its `matcher` must continue to exclude `_next/static`, `_next/image` and asset extensions.

### REQ-030 — Slug changes auto-create redirects

**P1**

**Acceptance criteria**

- Changing the slug of a published page automatically inserts a 301 from old path to new path.
- The auto-created entry is flagged in the CMS as system-generated, and is editable.
- The operator sees a confirmation naming both URLs before the change is applied.

### REQ-031 — 404 handling with correct status code

**P1**

A custom 404 already exists at `app/not-found.tsx`. The requirement is that it behaves correctly at the protocol level — returning HTTP 200 on a "not found" page is a common and quietly damaging Next.js misconfiguration.

**Acceptance criteria**

- Non-existent URLs return HTTP **404**, verified with `curl -I`.
- The 404 page is server-rendered.
- It does **not** carry `noindex` — a 404 status is the signal; the meta tag is redundant and can confuse diagnostics.
- It offers useful routes onward: services, contact, and the urgent-call path.
- 404s are monitored in Search Console after launch; recurring ones become redirects.

---

## 5. Sitemap, robots and rendering

### REQ-032 — Generated XML sitemap

**P0**

No sitemap exists today. Build `app/sitemap.ts` returning `MetadataRoute.Sitemap`, generated from the CMS rather than a hardcoded list.

**Acceptance criteria**

- `/sitemap.xml` returns valid XML conforming to the sitemaps.org spec.
- Entries are generated from the database: static routes, published `services`, published `blog_posts`, and (later) published location pages.
- Each entry carries `url` and `lastModified` — sourced from the row's `updated_at`, not the build time.
- Pages with `robotsIndex: false`, unpublished rows, or a future `publishAt` are excluded.
- Admin, auth and API routes never appear.
- Publishing content updates the sitemap within 60 seconds, via on-demand revalidation from the save action.
- `changeFrequency` and `priority` are optional and low-value — include them only if you have a real reason. Google largely ignores both.

### REQ-033 — Sitemap index

**P3**

**Acceptance criteria**

- Not needed at launch — the site has well under 100 URLs.
- If the blog and location pages push past ~500 URLs, split using `generateSitemaps`, which serves children at `/sitemap/[id].xml`.

### REQ-034 — robots.txt

**P1**

Build `app/robots.ts` returning `MetadataRoute.Robots`.

**Acceptance criteria**

- `/robots.txt` allows all crawlers by default and disallows `/admin`, `/auth`, `/api`, and any preview path.
- It references the sitemap at `https://johnviolaris.com/sitemap.xml`.
- The rules are readable from `site_settings` so they can be adjusted without a deploy.
- **A blocked page can still be indexed without its content.** To keep something out of the index, use `noindex` (REQ-006); `robots.txt` only prevents crawling. Never use both on the same URL — a crawler blocked from fetching the page cannot see the `noindex`.

### REQ-035 — Non-public routes excluded from indexing

**P0**

**Acceptance criteria**

- `/admin/*` and `/auth/*` emit `noindex, nofollow` at the layout level, not per-page.
- They also send an `X-Robots-Tag: noindex` response header, set in `proxy.ts`.
- Neither appears in the sitemap.
- Vercel preview deployments emit `noindex` site-wide — preview URLs getting indexed is a routine and avoidable mistake.

### REQ-036 — Server rendering for every indexable route

**P0**

**Acceptance criteria**

- Every indexable page returns complete HTML on first response — copy, headings, links, metadata and JSON-LD all present in View Source.
- With JavaScript disabled, all content and navigation remain readable.
- No SEO-relevant content is client-rendered. The interactive pieces (mega menu, mobile nav, service explorer, FAQ toggles) may hydrate on the client, but their **content** must be in the server HTML.
- Each route's rendering mode is audited and recorded once, at launch, in the checklist (§13).

### REQ-037 — Revalidation on publish

**P1**

**Acceptance criteria**

- Content pages are statically generated and revalidated on demand rather than per request.
- Publishing in the CMS triggers `revalidatePath` (or the tag equivalent) for the affected route, plus `/sitemap.xml`.
- The change is live within 60 seconds without a deploy.
- A manual "rebuild this page" control exists in the admin UI as an escape hatch.

---

## 6. Performance and Core Web Vitals

Core Web Vitals are a genuine ranking input, and they matter more than usual here because of who the visitor is: someone standing outside a police station, on mobile data, in a hurry. Slow is not just a ranking problem.

Targets are measured on **mobile**, Lighthouse simulated 4G, mid-tier device.

### REQ-038 — LCP under 2.5 seconds

**P1**

**Acceptance criteria**

- The hero portrait is the LCP element on most pages; it is served through `next/image`, preloaded, and correctly sized for mobile viewports (already the case at `components/sections/hero.tsx:124`).
- Source images are optimised before upload. The hero JPEG is a reasonable 366KB; the unreferenced 9.2MB PNG beside it is not (REQ-021).
- The hero uses `motion` for scroll-driven scale on the portrait. Confirm this does not delay LCP on mobile, and that it stays inert under `prefers-reduced-motion`.
- Fonts are preloaded. `next/font` already handles this for the three faces in `app/layout.tsx`.
- Lighthouse mobile shows LCP under 2.5s on home, a service page, and an article.

### REQ-039 — CLS under 0.1

**P1**

**Acceptance criteria**

- Every image has explicit dimensions (REQ-021).
- The TidyCal embed, if inline, has reserved space sized before load.
- The cookie/consent banner (REQ-054) overlays rather than pushing content down.
- The mobile contact bar animates in without displacing page content.
- `next/font` fallback metrics are configured to minimise swap shift.

### REQ-040 — INP under 200ms

**P2**

**Acceptance criteria**

- Third-party scripts load with `strategy="afterInteractive"` or `"lazyOnload"`.
- The mega menu, mobile nav and service explorer respond within 200ms of interaction.
- No main-thread task exceeds 50ms during normal interaction.
- `motion` animations use compositor-friendly properties (transform, opacity) and respect `prefers-reduced-motion`.

### REQ-041 — Third-party script management

**P1**

Every third-party script is a tax on the numbers above. Keep the list short and deliberate.

**Fields**

- `scripts` — collection of `{ name, src, strategy, enabled }`, editable in the CMS

**Acceptance criteria**

- All third-party scripts load via `next/script` with an explicit strategy.
- The expected list is short: GA4, a consent manager, TidyCal, and possibly a review widget. Anything beyond that needs a justification.
- The TidyCal embed loads only on pages that show a booking widget, not site-wide.
- A review-platform widget, if used, loads lazily and never blocks render.
- Scripts can be disabled from the CMS without a deploy.

### REQ-042 — Performance budget enforced in CI

**P2**

**Acceptance criteria**

- Lighthouse CI runs against home, a service page and an article on every pull request.
- The build warns when the performance score drops below 90 or any CWV target regresses.
- The client-side JavaScript bundle has a documented budget; exceeding it fails the check.

---

## 7. Location page architecture

**Decision: build the seam now, publish nothing at launch.**

For a motoring practice, location-qualified queries ("drink driving solicitor Manchester") are where a large share of commercial-intent search sits. But thin, templated location pages — the same paragraph with the city name swapped — are exactly what Google's helpful-content systems demote, and they can drag down the pages that _do_ rank. The right posture is to make the architecture available so no re-platforming is needed later, while publishing none until there is genuine content for each.

### REQ-043 — Location content type

**P3 (architecture) / deferred (content)**

**Fields**

- `locationName`, `slug`
- `service` — relation to `services`, enabling service × location pages
- `h1Heading`, `introCopy` — unique per location
- `courts` — named Magistrates' Courts covered, with genuinely local detail
- `localContext` — rich text; local procedure, listing practice, travel
- `faqItems` — location-specific
- `relatedLocations`, `parentService` — internal linking
- Full standard SEO field set per §1

**Acceptance criteria**

- The content type and route exist and render correctly from the CMS.
- Zero location pages are published at launch.
- The route is proven with one internal draft, then unpublished.

### REQ-044 — URL structure decided up front

**P3**

Changing this later means redirecting every page in the set.

**Acceptance criteria**

- Structure chosen and recorded before the first page publishes. Recommended: `/services/{service}/{location}` — it keeps the service as the primary entity and inherits existing breadcrumb and schema logic.
- The alternative, `/{location}/{service}`, is viable only if locations become genuinely first-class with their own hub pages.
- Whichever is chosen, it is applied consistently and never mixed.

### REQ-045 — Thin-content gate

**P2**

The guardrail that makes this architecture safe rather than dangerous.

**Acceptance criteria**

- A location page cannot be published until it carries a defined minimum of unique, non-templated content — set the threshold when the programme starts; something like 400 words of genuinely location-specific material.
- The CMS computes similarity against already-published location pages and blocks publication above a set threshold.
- Boilerplate shared across locations is excluded from the uniqueness calculation.
- Each page names real courts, real procedure, real local specifics — never a find-and-replace of the city name.

### REQ-046 — Location pages invisible until published

**P1**

**Acceptance criteria**

- Unpublished location pages return 404 to the public and do not appear in the sitemap.
- No navigation, footer or internal link points to an unpublished location page.
- The route pattern is not discoverable by crawling before content exists.

---

## 8. CMS workflow and publishing

This section is about the operator experience: John making changes without calling a developer. It builds on the tables already created in `supabase/migrations/20260914103000_create_cms_content_tables.sql`.

### REQ-047 — SEO panel on every editable entity

**P1**

**Acceptance criteria**

- Every editable content type — service, service page, blog post, fee, static page, location — exposes an SEO panel containing the full §1 field set.
- The panel shows a live Google-result preview: how the title and description will appear in search.
- Character counters with warning thresholds on title and description.
- The panel is collapsed by default so it does not clutter ordinary content editing.

### REQ-048 — Draft preview

**P1**

**Acceptance criteria**

- An admin can preview unpublished content exactly as it will appear live.
- Preview URLs require authentication and carry a tokenised, non-guessable path.
- Preview responses send `X-Robots-Tag: noindex` **and** a `noindex` meta tag.
- Preview URLs never appear in the sitemap.

### REQ-049 — Scheduled publishing

**P2**

**Fields**

- `publishAt` — optional timestamptz. The `blog_posts` table already has `published_at`
- `unpublishAt` — optional timestamptz

**Acceptance criteria**

- Content with a future `publishAt` is not publicly reachable and is absent from the sitemap until live.
- Content past `unpublishAt` returns 410 Gone (preferred over 404 — it tells Google the removal is intentional) and leaves the sitemap.
- Scheduling is timezone-explicit: Europe/London, with BST handled correctly.

### REQ-050 — Version history and audit log

**P2**

**Acceptance criteria**

- Each save creates a version snapshot.
- The audit log records who changed what and when.
- An operator can compare versions and revert.
- SEO field changes are captured in the same history — a lost meta description should be recoverable.

### REQ-051 — Role-based access

**P1**

The foundation exists: `profiles.role` and `private.is_admin()`, with RLS policies on every content table.

**Acceptance criteria**

- Roles are documented. If a third-party SEO consultant is engaged later, a role that can edit content and SEO fields but not manage users or delete content should exist.
- RLS is enforced at the database level, not only in the UI. The current migration does this correctly — keep it that way when adding tables.
- Destructive actions require explicit confirmation.

### REQ-052 — SEO health checks in the editor

**P2**

Cheap to build, and it catches the errors that otherwise accumulate silently over a year of content editing.

**Acceptance criteria**

- On save, the CMS flags: missing or over-length title; missing or over-length description; a description duplicated on another route; missing H1; multiple H1s; images without alt text; broken internal links; missing OG image.
- Warnings are advisory, not blocking — except where a P0 requirement says otherwise.
- A dashboard view lists all pages with outstanding SEO warnings.

---

## 9. Content type field map

The migration deliberately keeps most fields in a `content` jsonb column so the field list can be settled while building the admin UI, without a migration per field. This section defines what belongs in each payload, so those decisions are made once.

### Shared SEO payload (`seo_metadata.content`, keyed by `path`)

```
metaTitle, metaDescription, h1Heading, canonicalUrl,
robotsIndex, robotsFollow,
ogTitle, ogDescription, ogImage, ogType,
twitterCard, twitterTitle, twitterDescription, twitterImage,
customJsonLd
```

The same shape is embedded under a `seo` key inside each content row's own `content` jsonb, so an entity carries its metadata with it. `seo_metadata` is for routes with no backing row — the homepage, `/about`, `/contact`.

### `site_settings` (key/value)

- `business` — the REQ-010 record: name, legal name, contact, `areaServed`, `sameAs`, and the optional address/geo/hours
- `person` — the REQ-011 record for John
- `defaults` — default OG image, title template, fallback description
- `robots` — robots.txt rule overrides (REQ-034)
- `scripts` — third-party script registry (REQ-041)
- `analytics` — GA4 measurement ID, Search Console verification token

> Publicly readable by design — the migration grants `select` to `anon`. Never put secrets here.

### `services.content`

Nav label, card summary, offence-rail copy, icon key, group membership, plus `seo`.

### `service_pages.content`

Hero copy, overview, penalties, legal framework, defence considerations, process steps, evidence checklist, FAQ items (REQ-013), related services, CTA overrides, plus `seo`.

### `fees.content`

Description, inclusions list, exclusions, VAT treatment, disbursements, key stages, typical timescales, conditions. See REQ-061 — this content has a regulatory dimension, not only a marketing one.

### `testimonials.content`

Matter type, source platform, verification status, date, consent-to-publish flag.

### `blog_posts.content`

Excerpt, body blocks, featured image with alt, author reference, reviewed-by, last-reviewed date, related service, related posts, plus `seo`.

### Fields to add when the work starts

- `redirects` table (REQ-029) — not in the current migration
- `locations` table (REQ-043) — not in the current migration
- `enquiries` table with UTM capture (REQ-056) — not in the current migration

---

## 10. Analytics, consent and conversion tracking

**Decision: GA4 directly, plus Search Console. GTM specified but not installed at launch. No call-tracking vendor.**

The rationale is proportionate: John needs to know which pages generate enquiries. A full tag-management stack is overhead he will not use, and every extra script costs Core Web Vitals.

### REQ-053 — GA4 via `next/script`

**P0**

**Acceptance criteria**

- GA4 loads through `next/script` with `strategy="afterInteractive"`.
- The measurement ID comes from an environment variable, with separate properties for production and preview.
- Analytics does **not** load on preview deployments or `localhost`.
- Page views fire correctly across client-side App Router navigations, not just on first load.

### REQ-054 — UK consent handling before analytics fires

**P0**

UK GDPR and PECR require consent before setting non-essential cookies. This is a legal requirement, not a preference — and for a solicitor's website, getting it wrong is a poor look in a way it would not be for a shop.

**Acceptance criteria**

- A consent banner appears before any non-essential cookie is set.
- Reject is as easy as accept — a single click, equally prominent. A banner with a prominent "Accept" and a buried "Manage settings" does not meet the standard.
- Google Consent Mode v2 is implemented: `analytics_storage` and `ad_storage` default to `denied`, updating only on consent.
- The choice persists and is revocable from a link in the footer.
- A cookie policy page lists every cookie set, its purpose and its duration.
- The banner does not cause layout shift (REQ-039) and does not obscure the urgent-contact path on mobile.

### REQ-055 — Conversion events

**P0**

Every path to John is tracked, so it is possible to tell which pages actually produce enquiries.

**Required events**

| Event                 | Trigger                              | Parameters                          |
| --------------------- | ------------------------------------ | ----------------------------------- |
| `form_submit`         | Contact form submitted successfully  | `page_path`, `matter_type`          |
| `form_error`          | Submission fails validation or send  | `page_path`, `error_type`           |
| `phone_click`         | Any `tel:` link clicked              | `page_path`, `location` (header/footer/mobile bar/hero) |
| `whatsapp_click`      | Any WhatsApp link clicked            | `page_path`, `location`             |
| `email_click`         | Any `mailto:` link clicked           | `page_path`                         |
| `booking_click`       | TidyCal booking CTA clicked          | `page_path`                         |
| `booking_completed`   | TidyCal confirms a booking           | where the integration allows        |

**Acceptance criteria**

- Events fire from the shared components, not duplicated per page — the contact links already route through central config, so instrument them there once.
- `location` distinguishes where a click came from: whether the mobile contact bar outperforms the hero CTA is exactly the kind of thing worth knowing.
- Events are configured as GA4 conversions.
- Every event is verified in GA4 DebugView before launch.
- No personal data is ever sent in an event parameter. Names, phone numbers, email addresses and case details must never reach GA4 — this matters especially given the sensitivity of the enquiries.

### REQ-056 — UTM and referrer capture on enquiries

**P2**

**Acceptance criteria**

- Entry `utm_*` parameters and `gclid` persist across navigation in session storage.
- They are stored with the enquiry record when the form is submitted.
- The admin enquiry view shows the source, so John can see which channel produced the matter.
- Captured parameters never appear in a URL that could be shared or indexed.

### REQ-057 — Search Console and Bing Webmaster Tools

**P0**

**Acceptance criteria**

- Search Console property verified for `johnviolaris.com`, with the sitemap submitted.
- A separate property verified for `drivingjustice.co.uk` so the redirect can be monitored (REQ-025).
- Bing Webmaster Tools verified and sitemap submitted — Bing feeds several AI search surfaces, and it is fifteen minutes of work.
- Verification token stored in `site_settings`, not hardcoded.
- Email alerts enabled for coverage and manual-action issues.

### REQ-058 — GTM as an optional swap-in

**P3**

**Acceptance criteria**

- Analytics loading is abstracted behind one module, so swapping GA4-direct for a GTM container is a single-file change.
- If GTM is later adopted, all §REQ-055 events push to `dataLayer` with the same names and parameters, so historical reporting stays comparable.
- Not installed at launch.

---

## 11. Accessibility

Accessibility is a ranking-adjacent concern and a professional one. A solicitor's website that a visually impaired client cannot use is a poor result on its own terms, independent of Google.

Some foundations already exist: a skip link, a `<main id="main">` landmark, keyboard-navigable mega menu with Escape dismissal, focus trapping in the mobile nav, native `details`/`summary` FAQs, and `prefers-reduced-motion` support.

### REQ-059 — WCAG 2.2 AA

**P1**

**Acceptance criteria**

- Lighthouse accessibility scores 95+ on every page type.
- axe DevTools reports no critical or serious issues.
- Manual keyboard pass: every interactive element reachable, operable and visibly focused.
- Screen reader pass (NVDA or VoiceOver) on home, a service page and the contact form.
- Contrast meets 4.5:1 for body text and 3:1 for large text — worth re-checking the gold-on-navy and cream-on-navy pairings specifically.
- Every form field has a programmatically associated label; errors are announced, not signalled by colour alone.
- Icon-only buttons carry accessible names.

### REQ-060 — Heading hierarchy and landmarks

**P1**

**Acceptance criteria**

- One `<h1>` per page (REQ-003), with no skipped heading levels.
- Landmarks used correctly: `header`, `nav`, `main`, `article`, `footer`.
- Headings describe content; they are never chosen for their visual size.
- The article template's "on this page" navigation is generated from real headings and stays in sync.

---

## 12. Regulatory and content constraints

**This section has no equivalent in the source document, and it is the most important difference.** A US contractor's website has marketing constraints. A solicitor's website has regulatory ones. Several items here are compliance obligations, not optimisations — and they interact directly with SEO, because the Fees page is simultaneously a conversion page, a ranking asset, and a regulated disclosure.

> **Every item below must be confirmed with John, and with his firm's compliance officer if he practises through an SRA-regulated firm.** Nothing here should be implemented from this document alone. It is written to make sure the right questions get asked before launch, not to substitute for compliance advice.

### REQ-061 — Price and service transparency on the Fees page

**P1 — confirm with John before launch**

The SRA Transparency Rules require regulated firms to publish price and service information for certain prescribed work. **Motoring offences — summary offences only, in the Magistrates' Court — is explicitly one of the prescribed areas**, which puts a substantial part of John's practice directly in scope.

**Where in scope, the published information generally needs to cover**

- Total cost, or an average or realistic range, with the basis of the charge
- Whether VAT is included, and at what rate
- Likely disbursements, with cost or best estimate
- The key stages of the matter
- Typical timescales
- The qualifications and experience of whoever does the work, and of their supervisor

**Acceptance criteria**

- Confirm with John whether the rules apply to his practice and in what form.
- If they apply, the Fees page carries the required information and the CMS fee fields (§9) accommodate all of it.
- Fee content is CMS-editable, since the rules require it to be kept up to date.
- The information is reachable in a small number of clicks from the homepage, clearly signposted.

**Why it sits in an SEO document.** "Solicitor fees" queries convert well, and a compliant transparency disclosure is substantial, genuinely useful content — which is also what ranks. The compliance requirement and the SEO opportunity point the same way here.

### REQ-062 — Regulatory information in the footer

**P1 — confirm with John before launch**

**Typically required for an SRA-regulated firm**

- SRA number and a statement of authorisation and regulation by the Solicitors Regulation Authority
- The SRA digital badge
- Complaints procedure, including how and when to complain to the Legal Ombudsman and to the SRA
- Registered name and trading names
- VAT number, if registered

**Acceptance criteria**

- Confirm exactly which obligations attach — this depends on whether John practises through a regulated firm, as a sole practitioner, or is employed elsewhere.
- **The site must not imply a regulatory status that does not exist.** `lib/site-config.ts` currently holds `sraNumber: null` and no number is invented anywhere, which is correct. Keep it that way until a verified number is supplied.
- Once confirmed, these details live in `site_settings` and render site-wide from one source.
- The same SRA number appears in the schema `identifier` (REQ-010).

### REQ-063 — E-E-A-T signals on legal content

**P1**

Legal advice is "Your Money or Your Life" content in Google's terms, held to the highest quality bar. For a personal-brand site, the author signals are the moat.

**Acceptance criteria**

- Every article carries a visible byline attributing it to John, with his role and qualification.
- Every article shows a visible last-reviewed date matching `dateModified` (REQ-015).
- The byline links to the About page, which carries the `Person` schema (REQ-011).
- Statutory references in article content are accurate and dated — legal content that cites a superseded provision is worse than no content.
- A documented review cycle exists for keeping content current, with the interval recorded in the CMS per article.
- Articles state clearly that they are general information, not advice on the reader's specific matter.

### REQ-064 — No guaranteed outcomes

**P0**

Restating PRD §25 because it constrains SEO copy directly, and meta descriptions are exactly where this temptation lands.

**Acceptance criteria**

- No title, description, heading, schema field or article body promises an outcome. Not "Save Your Licence", not "Get Your Case Dropped".
- Approved framing: "John will assess the available defence and mitigation options in your case."
- The constraint is documented in the CMS next to the SEO fields, where a future copywriter will actually see it.
- Applies equally to OG titles, which are easy to overlook.

### REQ-065 — No fabricated credentials, results or reviews

**P0**

**Acceptance criteria**

- No SRA number, credential, award, case result, testimonial, phone number, address or price is invented — this is a professional-conduct matter as much as an SEO one.
- Unconfirmed values use obvious placeholders and are never rendered as if real. The current codebase does this correctly: phone and WhatsApp links fall back to the contact page rather than dialling a placeholder.
- Testimonials record their source and whether consent to publish was obtained.
- `AggregateRating` reflects a real, countable review set or is omitted (REQ-016).
- Nothing enters schema markup that is not true and not visible on the page.

---

## 13. Pre-launch checklist

Work through this before the site is opened to crawlers. Record the result of each line — this is the audit trail if something goes wrong later.

**Indexing and crawl**

- [ ] `robots.txt` live, correct, referencing the sitemap
- [ ] `sitemap.xml` live, complete, no unpublished or admin URLs
- [ ] Search Console verified for `johnviolaris.com`, sitemap submitted
- [ ] Search Console verified for `drivingjustice.co.uk`, redirect confirmed
- [ ] Bing Webmaster Tools verified
- [ ] Every page's rendering mode audited and recorded
- [ ] No stray `noindex` on a page that should be indexed — the single most common launch-day error
- [ ] Vercel preview deployments confirmed `noindex`

**Domains and redirects**

- [ ] `drivingjustice.co.uk` 301s path-for-path to `johnviolaris.com`
- [ ] apex/www policy decided, enforced, canonical tags agree
- [ ] HTTP → HTTPS enforced, SSL active on both domains
- [ ] Legacy URL inventory complete, or absence of history recorded
- [ ] Trailing-slash and lowercase policies enforced
- [ ] 404 returns HTTP 404, verified with `curl -I`

**Metadata and schema**

- [ ] Every page has a unique title and description
- [ ] Every page has exactly one `<h1>`
- [ ] Canonical tags present, absolute, self-referencing
- [ ] Rich Results Test passes on home, service page, article, about
- [ ] No schema field contains placeholder or invented data
- [ ] `sameAs` URLs all resolve
- [ ] OG previews checked in WhatsApp, LinkedIn, iMessage

**Performance and accessibility**

- [ ] Lighthouse mobile 90+ on home, service page, article
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile
- [ ] Hero image optimised and served through `next/image`
- [ ] Image filenames URL-safe; unreferenced `John Violaris 2.png` removed from `public/`
- [ ] Lighthouse accessibility 95+
- [ ] Keyboard and screen-reader passes complete
- [ ] Tested at 375px, 768px, 1024px, 1440px

**Analytics and consent**

- [ ] GA4 firing, page views correct across client-side navigation
- [ ] Consent banner compliant; reject as easy as accept
- [ ] Consent Mode v2 configured, defaults denied
- [ ] All conversion events verified in DebugView
- [ ] No personal data in any event parameter
- [ ] Cookie policy page live and accurate

**Compliance**

- [ ] SRA number confirmed and rendered, or confirmed not applicable
- [ ] Regulatory footer information confirmed with John
- [ ] Fees page transparency requirements confirmed and met
- [ ] Complaints and Legal Ombudsman information published
- [ ] No guaranteed-outcome language anywhere, meta descriptions included
- [ ] No fabricated credentials, results or reviews
- [ ] Privacy policy and terms live

**First month after launch**

- [ ] Search Console coverage checked weekly for indexing errors
- [ ] Core Web Vitals field data reviewed once real traffic exists
- [ ] 404 report reviewed, recurring misses converted to redirects
- [ ] Conversion events producing sensible data
- [ ] Branded search ("John Violaris") returns the site first
- [ ] Knowledge panel eligibility assessed once entity signals settle

---

## 14. Requirements summary

| ID          | Requirement                                     | Priority | Section |
| ----------- | ----------------------------------------------- | -------- | ------- |
| **REQ-001** | Editable meta title per route                   | **P0**   | §1      |
| **REQ-002** | Editable meta description per route             | **P0**   | §1      |
| **REQ-003** | H1 editable separately from meta title          | **P0**   | §1      |
| **REQ-004** | Editable URL slug                               | **P0**   | §1      |
| **REQ-005** | Canonical URL per route                         | **P0**   | §1      |
| **REQ-006** | Per-page robots directives                      | **P1**   | §1      |
| **REQ-007** | Open Graph fields per page                      | **P1**   | §1      |
| **REQ-008** | Twitter / X card fields                         | **P2**   | §1      |
| **REQ-009** | Defined metadata resolution order               | **P0**   | §1      |
| **REQ-010** | Site-wide LegalService schema, CMS-driven       | **P0**   | §2      |
| **REQ-011** | Person schema for John                          | **P0**   | §2      |
| **REQ-012** | Service schema on service pages                 | **P0**   | §2      |
| **REQ-013** | FAQPage schema for FAQ blocks                   | **P1**   | §2      |
| **REQ-014** | BreadcrumbList on all non-home pages            | **P1**   | §2      |
| **REQ-015** | BlogPosting schema on articles                  | **P1**   | §2      |
| **REQ-016** | Review and AggregateRating schema               | **P2**   | §2      |
| **REQ-017** | Entity graph with stable `@id` references       | **P1**   | §2      |
| **REQ-018** | Per-page custom JSON-LD escape hatch            | **P2**   | §2      |
| **REQ-019** | Schema validation gate before publication       | **P1**   | §2      |
| **REQ-020** | Editable alt text on every image                | **P0**   | §3      |
| **REQ-021** | All images through `next/image`                 | **P0**   | §3      |
| **REQ-022** | Descriptive filenames on CMS upload             | **P1**   | §3      |
| **REQ-023** | Image title and caption                         | **P3**   | §3      |
| **REQ-024** | Open Graph image fallback                       | **P2**   | §3      |
| **REQ-025** | Single canonical host                           | **P0**   | §4      |
| **REQ-026** | Legacy URL inventory before switchover          | **P1**   | §4      |
| **REQ-027** | Trailing slash policy                           | **P1**   | §4      |
| **REQ-028** | Lowercase URL enforcement                       | **P1**   | §4      |
| **REQ-029** | CMS-managed redirect table                      | **P1**   | §4      |
| **REQ-030** | Slug changes auto-create redirects              | **P1**   | §4      |
| **REQ-031** | 404 handling with correct status code           | **P1**   | §4      |
| **REQ-032** | Generated XML sitemap                           | **P0**   | §5      |
| **REQ-033** | Sitemap index                                   | **P3**   | §5      |
| **REQ-034** | robots.txt                                      | **P1**   | §5      |
| **REQ-035** | Non-public routes excluded from indexing        | **P0**   | §5      |
| **REQ-036** | Server rendering for every indexable route      | **P0**   | §5      |
| **REQ-037** | Revalidation on publish                         | **P1**   | §5      |
| **REQ-038** | LCP under 2.5 seconds                           | **P1**   | §6      |
| **REQ-039** | CLS under 0.1                                   | **P1**   | §6      |
| **REQ-040** | INP under 200ms                                 | **P2**   | §6      |
| **REQ-041** | Third-party script management                   | **P1**   | §6      |
| **REQ-042** | Performance budget enforced in CI               | **P2**   | §6      |
| **REQ-043** | Location content type                           | **P3**   | §7      |
| **REQ-044** | URL structure decided up front                  | **P3**   | §7      |
| **REQ-045** | Thin-content gate                               | **P2**   | §7      |
| **REQ-046** | Location pages invisible until published        | **P1**   | §7      |
| **REQ-047** | SEO panel on every editable entity              | **P1**   | §8      |
| **REQ-048** | Draft preview                                   | **P1**   | §8      |
| **REQ-049** | Scheduled publishing                            | **P2**   | §8      |
| **REQ-050** | Version history and audit log                   | **P2**   | §8      |
| **REQ-051** | Role-based access                               | **P1**   | §8      |
| **REQ-052** | SEO health checks in the editor                 | **P2**   | §8      |
| **REQ-053** | GA4 via `next/script`                           | **P0**   | §10     |
| **REQ-054** | UK consent handling before analytics fires      | **P0**   | §10     |
| **REQ-055** | Conversion events                               | **P0**   | §10     |
| **REQ-056** | UTM and referrer capture on enquiries           | **P2**   | §10     |
| **REQ-057** | Search Console and Bing Webmaster Tools         | **P0**   | §10     |
| **REQ-058** | GTM as an optional swap-in                      | **P3**   | §10     |
| **REQ-059** | WCAG 2.2 AA                                     | **P1**   | §11     |
| **REQ-060** | Heading hierarchy and landmarks                 | **P1**   | §11     |
| **REQ-061** | Price and service transparency on the Fees page | **P1**   | §12     |
| **REQ-062** | Regulatory information in the footer            | **P1**   | §12     |
| **REQ-063** | E-E-A-T signals on legal content                | **P1**   | §12     |
| **REQ-064** | No guaranteed outcomes                          | **P0**   | §12     |
| **REQ-065** | No fabricated credentials, results or reviews   | **P0**   | §12     |

---

## Open questions for John

Answer these before SEO implementation begins. Each one blocks or reshapes a requirement above.

1. **SRA number and regulatory status.** Is John a sole practitioner, a partner, or employed by a regulated firm? This determines REQ-061 and REQ-062 entirely, and affects the schema type in REQ-010. `lib/site-config.ts` holds `sraNumber: null` until answered.
2. **Business address.** Is there a publishable office address? If yes, a Google Business Profile becomes worth pursuing and REQ-010 gains address, geo and hours. If no, the site stays a national-coverage entity.
3. **Fees.** Which services have confirmed fixed fees? Needed for REQ-012 `offers` and for the REQ-061 transparency disclosure.
4. **Review platforms.** Which profiles exist — ReviewSolicitors, Trustpilot, Google? Needed for `sameAs` (REQ-010) and to decide whether REQ-016 is worth building.
5. **`drivingjustice.co.uk` history.** Has it ever been live and indexed? Determines whether REQ-026 is a real piece of work or a one-line note.
6. **Contact details.** Phone, WhatsApp and TidyCal URL are still placeholders in `lib/site-config.ts`. They must be real before launch — they are a schema input, a conversion path, and a tracked event.
7. **Location programme.** Which towns and Magistrates' Courts would matter most, when the time comes? Not needed for launch, but it shapes what REQ-044 should look like.

---

_Companion documents: `prd.md` (product requirements) · `AGENTS.md` (Next.js version constraints) · `README.md` (current implementation state)._
