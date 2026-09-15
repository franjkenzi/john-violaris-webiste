**SEOTechnical**

**Requirements**

**Fine Element Construction**

_<www.fineelm.com> | Next.js stack_

# **1\. Per-Page Editable Meta Fields**

Every page type on the site (homepage, service pages, portfolio entries, blog posts, city pages, custom pages) must expose a complete set of SEO meta fields editable through the CMS without code changes. These fields must override any default or auto-generated values.

**REQ-001 Editable meta title per page**

**P0 — CRITICAL**

Each page must have an editable meta title field in the CMS that populates the &lt;title&gt; tag in the rendered HTML. The field must support up to 70 characters and must be required on save (or fall back to a defined template if empty).

**Fields required:**

- **metaTitle** — String, 1–70 chars, required
- **metaTitleTemplate** — Fallback pattern at the site level, e.g. "{pageTitle} | Fine Element Construction"

**Acceptance criteria:**

- Editing the field in the CMS and republishing updates the &lt;title&gt; tag without code deploy.
- If the field is empty, the system falls back to the site-level template.
- Character count is displayed in the CMS with a warning above 60 characters.
- Title appears in the &lt;head&gt; server-side rendered HTML (verifiable via View Source, not just DevTools).

**REQ-002 Editable meta description per page**

**P0 — CRITICAL**

Each page must have an editable meta description field populating the &lt;meta name="description"&gt; tag. Support up to 160 characters.

**Fields required:**

- **metaDescription** — String, 1–160 chars, required

**Acceptance criteria:**

- Editing the field in the CMS and republishing updates the meta description without code deploy.
- Character count is displayed in the CMS with a warning above 155 characters.
- Description appears in the &lt;head&gt; server-side rendered HTML.

**REQ-003 Editable H1 separated from page title**

**P0 — CRITICAL**

The H1 heading visible on the page must be a separate editable field from the meta title. Often the H1 ("Bathroom Remodeling in Bellevue, WA") differs from the meta title ("Bellevue Bathroom Remodelers | Fine Element Construction"). Both must be controllable independently.

**Fields required:**

- **h1Heading** — String, 1–80 chars, required
- **metaTitle** — Separate field per REQ-001

**Acceptance criteria:**

- Each page renders exactly one &lt;h1&gt; tag.
- H1 content matches the h1Heading field, not the metaTitle field.
- Other headings on the page use &lt;h2&gt;, &lt;h3&gt;, &lt;h4&gt; as appropriate, never duplicate &lt;h1&gt;.

**REQ-004 Editable URL slug per page**

**P0 — CRITICAL**

Every page must have an editable URL slug in the CMS. Slugs must be unique within their parent path, lowercase, hyphen-separated, ASCII-only, and validated on save.

**Fields required:**

- **slug** — String, lowercase, hyphens only, unique within parent path

**Acceptance criteria:**

- Slug field validates against the allowed pattern (^\[a-z0-9-\]+\$).
- Changing a slug automatically creates a 301 redirect from the old URL to the new URL (see REQ-024).
- Duplicate slugs in the same path are rejected with a clear error.

**REQ-005 Editable canonical URL per page**

**P1 — HIGH**

Each page must expose an optional canonical URL field. By default the canonical URL equals the page's own URL (self-referencing), but it must be overridable for pages that are duplicates or near-duplicates of another page.

**Fields required:**

- **canonicalUrl** — Optional URL. If empty, defaults to the page's own absolute URL.

**Acceptance criteria:**

- Every page renders &lt;link rel="canonical" href="..."&gt; in &lt;head&gt;.
- If canonicalUrl is set, it overrides the default.
- If empty, the system generates a self-referencing canonical with the full <https://www.fineelm.com/>... URL.

**REQ-006 Editable robots directives per page**

**P1 — HIGH**

Each page must support per-page robots directives. The operator must be able to set noindex, nofollow, noarchive, etc., on a per-page basis through the CMS without touching code.

**Fields required:**

- **robotsIndex** — Boolean, defaults to true. If false, page outputs noindex.
- **robotsFollow** — Boolean, defaults to true. If false, page outputs nofollow.

**Acceptance criteria:**

- Page renders &lt;meta name="robots" content="..."&gt; reflecting field values.
- Default behavior: index, follow.
- Operator can toggle per-page in the CMS.

## **Open Graph and social card fields**

**REQ-007 Open Graph fields per page**

**P1 — HIGH**

Each page must expose editable Open Graph fields used by Facebook, LinkedIn, iMessage, Slack, and most social platforms when the URL is shared.

**Fields required:**

- **ogTitle** — String, defaults to metaTitle if empty
- **ogDescription** — String, defaults to metaDescription if empty
- **ogImage** — Image upload, recommended 1200×630px
- **ogType** — Enum: website, article. Defaults to website.

**Acceptance criteria:**

- Page renders og:title, og:description, og:image, og:url, og:type, og:site_name in &lt;head&gt;.
- If ogImage is empty, a site-level default image is used.
- Image dimensions are validated on upload (warning if smaller than 1200×630).

_Example expected output:_

```
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://www.fineelm.com/..." />
<meta property="og:url" content="https://www.fineelm.com/..." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Fine Element Construction" />
```

**REQ-008 Twitter Card fields per page**

**P2 — MEDIUM**

Each page must render Twitter Card meta tags. Fields can default to OG values but must be overridable.

**Fields required:**

- **twitterCardType** — Enum: summary, summary_large_image. Defaults to summary_large_image.
- **twitterTitle** — Optional, defaults to ogTitle
- **twitterDescription** — Optional, defaults to ogDescription
- **twitterImage** — Optional image upload, defaults to ogImage

**Acceptance criteria:**

- Page renders twitter:card, twitter:title, twitter:description, twitter:image in &lt;head&gt;.
- Falls back to OG values when Twitter-specific fields are empty.

# **2\. Structured Data (Schema.org / JSON-LD)**

Schema markup is the single highest-leverage technical SEO element on this site. It powers Google rich results, Local Pack ranking, and AI search engine entity recognition. The current site has minimal or no schema markup. The backend must programmatically generate the correct schema for each page type, and operators must be able to override or extend it per page where needed.

_All schema must be output as JSON-LD in &lt;script type="application/ld+json"&gt; tags in &lt;head&gt;. No microdata, no RDFa. JSON-LD only._

**REQ-009 Site-wide LocalBusiness / GeneralContractor schema**

**P0 — CRITICAL**

Every page on the site must include a LocalBusiness schema block (specifically of type GeneralContractor) describing Fine Element Construction. This is generated programmatically from a single CMS-editable "Business Information" record.

**Fields required:**

- **businessName** — String — "Fine Element Construction"
- **legalName** — String — "Fine Element Construction, LLC"
- **streetAddress** — String
- **addressLocality** — City
- **addressRegion** — State (WA)
- **postalCode** — ZIP
- **telephone** — Single source-of-truth phone
- **email** — Contact email
- **geoLatitude** — Decimal
- **geoLongitude** — Decimal
- **openingHours** — Array of day/time ranges
- **priceRange** — String, e.g. \$\$\$
- **areaServed** — Array of city names
- **license** — WA contractor license number
- **sameAs** — Array of social and citation URLs (GMB, Yelp, Facebook, BBB, Houzz, Instagram, LinkedIn)
- **logo** — Image URL, absolute
- **image** — Image URL, absolute

**Acceptance criteria:**

- Schema block validates without errors on the Google Rich Results Test.
- Schema block validates without errors on Schema.org validator.
- All sameAs URLs resolve to live profiles.
- Editing the business record in the CMS updates the schema across all pages with no code deploy.

_Example expected output:_

```
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "name": "Fine Element Construction",
  "legalName": "Fine Element Construction, LLC",
  "image": "https://www.fineelm.com/images/...",
  "telephone": "+1-425-522-5441",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "11200 Kirkland Way, Suite 350",
    "addressLocality": "Kirkland",
    "addressRegion": "WA",
    "postalCode": "98033",
    "addressCountry": "US"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 47.67, "longitude": -122.20 },
  "areaServed": ["Seattle", "Bellevue", "Kirkland", "..."],
  "sameAs": ["https://...", "..."]
}
</script>
```

**REQ-010 Service schema on each service page**

**P0 — CRITICAL**

Each service page (kitchen remodel, bathroom remodel, deck build, roofing, restoration, full home renovation) must output a Service schema describing the offering, the provider (linked to the LocalBusiness), the area served, and any relevant categories.

**Fields required:**

- **serviceName** — String, per service page
- **serviceType** — Schema.org service type or controlled vocabulary
- **serviceDescription** — String, per service page
- **areaServed** — Inherits from business record by default, overridable per service

**Acceptance criteria:**

- Each service page renders a Service schema in addition to the site-wide LocalBusiness schema.
- Service schema includes provider linking back to the LocalBusiness via @id.
- Validates on Google Rich Results Test.

**REQ-011 AggregateRating and Review schema**

**P1 — HIGH**

The site must support outputting AggregateRating schema (averaged review score, total review count) on the homepage and key service pages, and Review schema for individual testimonials displayed on the testimonials page.

**Fields required:**

- **aggregateRatingValue** — Decimal (e.g. 4.9). Editable per CMS field.
- **aggregateReviewCount** — Integer total review count
- **individualReviews** — Collection of {author, rating, datePublished, reviewBody}

**Acceptance criteria:**

- Homepage and key service pages include AggregateRating schema.
- Testimonials page renders Review schema for each testimonial.
- Schema validates on Google Rich Results Test.
- Note: per Google guidelines, aggregateRating values must reflect actual reviews — implementation should pull from real review data or be operator-curated honestly.

**REQ-012 FAQ schema for FAQ blocks**

**P1 — HIGH**

The CMS must support adding FAQ blocks to any page (service pages, city pages, blog posts). When an FAQ block is present, the page must emit FAQPage schema containing each question and answer.

**Fields required:**

- **faqItems** — Array of { question: String, answer: RichText }

**Acceptance criteria:**

- Page with an FAQ block renders FAQPage schema in &lt;head&gt;.
- Schema includes mainEntity array of Question/Answer pairs.
- Validates on Google Rich Results Test.
- Operator can add, edit, reorder FAQ items in the CMS without code changes.

**REQ-013 BreadcrumbList schema on all pages**

**P1 — HIGH**

Every page (except the homepage) must emit BreadcrumbList schema reflecting the page's position in the site hierarchy. The breadcrumbs should match any visible breadcrumb navigation on the page.

**Acceptance criteria:**

- Every non-home page renders BreadcrumbList schema.
- Each breadcrumb item has position, name, and item (URL).
- Validates on Google Rich Results Test.

**REQ-014 Article schema on blog posts**

**P2 — MEDIUM**

Blog posts must emit Article schema (or BlogPosting) including headline, image, datePublished, dateModified, author, and publisher (linked to the LocalBusiness).

**Fields required:**

- **author** — String or Person reference
- **datePublished** — ISO 8601 date
- **dateModified** — ISO 8601 date, auto-updated on save
- **featuredImage** — Image with dimensions

**Acceptance criteria:**

- Blog post pages render Article schema in &lt;head&gt;.
- datePublished and dateModified are correctly populated.
- Validates on Google Rich Results Test.

**REQ-015 Per-page custom JSON-LD escape hatch**

**P2 — MEDIUM**

For edge cases where the operator needs to add or override structured data not covered by the standard schemas (e.g. Event schema for showroom open houses, Offer schema for promotions), the CMS must expose a free-form JSON-LD field per page.

**Fields required:**

- **customJsonLd** — RawJSON, validated on save

**Acceptance criteria:**

- Operator can paste valid JSON-LD into the field via the CMS.
- Invalid JSON is rejected with a clear error message.
- Valid JSON-LD is rendered in &lt;head&gt; in addition to the page's auto-generated schemas.

# **3\. Images, Alt Text, and Media Optimization**

The portfolio is one of Fine Element's strongest SEO and conversion assets — hundreds of high-quality project photos. But for that asset to deliver SEO value, every image must have editable alt text, descriptive filenames, proper dimensions, and lazy loading. Currently most of this is either missing or hard-coded.

**REQ-016 Editable alt text on every image**

**P0 — CRITICAL**

Every image uploaded through the CMS (portfolio photos, service page imagery, blog imagery, hero images) must have an editable alt text field. Alt text must be required for portfolio photos and content imagery. Decorative-only images can be marked decorative and use alt="".

**Fields required:**

- **altText** — String, required unless isDecorative is true
- **isDecorative** — Boolean. If true, alt="" is rendered.

**Acceptance criteria:**

- Every &lt;img&gt; tag on the site has an alt attribute.
- Operator can edit alt text per image through the CMS without code changes.
- Required-field validation fires on save if altText is missing and isDecorative is false.

**REQ-017 Editable image title and caption**

**P2 — MEDIUM**

Each image must support an optional title attribute and an optional visible caption.

**Fields required:**

- **title** — String, optional. Populates title attribute on &lt;img&gt;.
- **caption** — RichText, optional. Rendered below image when set.

**Acceptance criteria:**

- Title and caption fields are editable in the CMS.
- Caption renders visibly when populated, hidden when empty.

**REQ-018 Descriptive image filenames on upload**

**P1 — HIGH**

When an image is uploaded, the CMS must allow the operator to set or rename the served filename. The current implementation appears to use auto-generated hashes (Supabase storage). Filenames like "dsc00860.jpg" should be replaceable with "bathroom-remodel-bellevue-modern-freestanding-tub.jpg".

**Fields required:**

- **filename** — String, becomes the served URL's last segment

**Acceptance criteria:**

- Operator can rename the served filename in the CMS.
- Renaming triggers a 301 redirect from the old image URL to the new one.
- Filename is validated to be URL-safe (lowercase, hyphens, no spaces, ASCII).

**REQ-019 Next.js Image component with responsive sizing**

**P0 — CRITICAL**

Every image on the site must use the Next.js &lt;Image&gt; component (or equivalent) with: lazy loading by default (eager only for above-the-fold hero images), srcset for responsive sizing, WebP and AVIF format negotiation, and explicit width/height to prevent Cumulative Layout Shift.

**Acceptance criteria:**

- All &lt;img&gt; tags rendered server-side include width and height attributes.
- Below-the-fold images use loading="lazy".
- Hero / LCP images use priority loading.
- WebP and AVIF are served to browsers that support them via the picture element or Accept header negotiation.
- Lighthouse audit shows no Cumulative Layout Shift caused by images.

**REQ-020 Open Graph / social card image generation**

**P2 — MEDIUM**

Pages without an explicitly uploaded ogImage (REQ-007) should optionally have the system generate a default social card image (Vercel OG, @vercel/og, or equivalent) showing the page title and a Fine Element branded background.

**Acceptance criteria:**

- If ogImage is empty, system generates a 1200×630 social card with page title on Fine Element branded background.
- Generated images are cached and served from CDN.
- Operator can preview the generated card in the CMS.

# **4\. URLs, Redirects, and Routing**

The site currently has a domain consolidation problem (fineelm.com legacy vs <www.fineelm.com> primary) and likely has some URL structure issues in the portfolio. This section specifies what the routing layer must support for clean ongoing operation.

**REQ-021 Domain consolidation — single canonical host**

**P0 — CRITICAL**

All requests to fineelm.com (no www) must 301 redirect to <https://www.fineelm.com> preserving the full path and query string. All HTTP requests must 301 redirect to HTTPS.

**Acceptance criteria:**

- fineelm.com/anything → 301 → <https://www.fineelm.com/anything>
- <http://www.fineelm.com/anything> → 301 → <https://www.fineelm.com/anything>
- Any legacy URLs on the old WordPress site must be inventoried and mapped to current URLs with 301s.
- Legacy URLs without an equivalent should redirect to the closest relevant page (not to the homepage by default — case-by-case mapping).

**REQ-022 Trailing slash policy enforced consistently**

**P1 — HIGH**

Either all URLs have trailing slashes or none do — pick one and 301 redirect the other variant. Mixed trailing slash policy creates duplicate content signals.

**Acceptance criteria:**

- Pick one policy and document it (recommend: no trailing slashes for cleaner URLs).
- Opposite variant 301 redirects to canonical variant.
- Internal links use the canonical variant consistently.

**REQ-023 Lowercase URL enforcement**

**P1 — HIGH**

All URLs must be lowercase. Requests for URLs containing uppercase characters must 301 redirect to the lowercase version.

**Acceptance criteria:**

- /Portfolio/Kitchen-Remodel-... → 301 → /portfolio/kitchen-remodel-...
- All internal links use lowercase URLs only.

**REQ-024 CMS-managed redirect table**

**P0 — CRITICAL**

The CMS must expose a redirects management interface where operators can add, edit, and delete URL redirects without developer involvement. Each redirect entry must support source URL, destination URL, and redirect type (301, 302).

**Fields required:**

- **redirects** — Collection of { source: String, destination: String, type: Enum(301, 302), createdAt, notes }

**Acceptance criteria:**

- Operator can add a new redirect through the CMS.
- Renaming a page slug (REQ-004) auto-creates a 301 in the redirects table from the old slug to the new one.
- Redirect chains are detected and warned (A→B→C should be flattened to A→C).
- Redirect loops are rejected on save.
- Redirects apply at the edge / middleware layer, not via client-side JavaScript.

**REQ-025 Custom 404 page with proper status code**

**P1 — HIGH**

The 404 page must return HTTP status 404, not 200 (this is a common Next.js misconfiguration). The page must be branded, useful (showing popular services and search), and not interfere with crawling.

**Acceptance criteria:**

- Non-existent URLs return HTTP 404 status (verifiable via curl -I).
- 404 page is server-rendered, not client-side rendered.
- 404 page does not include noindex meta — it should be discoverable by search engines as a 404.

# **5\. Sitemap, Robots, and Rendering**

Search engines need three things to crawl the site properly: a complete and up-to-date sitemap, clear robots directives, and HTML that contains real content on the server side (not client-rendered placeholders). Each of these is currently uncertain in the existing implementation.

**REQ-026 Dynamically generated XML sitemap**

**P0 — CRITICAL**

The site must serve an XML sitemap at /sitemap.xml that is auto-generated from the CMS content. The sitemap must update automatically when content is published, unpublished, or modified — no manual regeneration step.

**Acceptance criteria:**

- /sitemap.xml returns valid XML conforming to sitemaps.org spec.
- Every published, indexable page appears in the sitemap.
- Each entry includes &lt;loc&gt;, &lt;lastmod&gt;, and where applicable &lt;changefreq&gt; and &lt;priority&gt;.
- Pages with robotsIndex=false (REQ-006) are excluded.
- Sitemap is submitted to Google Search Console and Bing Webmaster Tools.
- Sitemap regenerates within 60 seconds of content changes.

**REQ-027 Sitemap index for scalability**

**P3 — NICE TO HAVE**

If the sitemap grows beyond 200 URLs (portfolio additions will get there fast), implement a sitemap index splitting by content type (pages, portfolio, blog).

**Acceptance criteria:**

- /sitemap.xml becomes a sitemap index referencing /sitemap-pages.xml, /sitemap-portfolio.xml, /sitemap-blog.xml.
- Each child sitemap stays under 50,000 URLs and 50MB.

**REQ-028 Editable robots.txt**

**P1 — HIGH**

The site must serve /robots.txt with sensible defaults (allow all, point to sitemap). The contents must be editable through the CMS without a code deploy. Different rules for different user agents must be supported.

**Fields required:**

- **robotsTxt** — Multi-line text field, edited via CMS, served at /robots.txt

**Acceptance criteria:**

- /robots.txt returns the current CMS-stored content.
- Operator can edit and republish without code deploy.
- robots.txt references the sitemap URL.
- By default: User-agent: \* / Allow: / / Sitemap: <https://www.fineelm.com/sitemap.xml>

**REQ-029 Server-side rendering for all indexable pages**

**P0 — CRITICAL**

Every page that should be indexed by search engines must serve fully rendered HTML on the initial server response. Client-side rendering for SEO-critical content is unacceptable. Next.js supports SSR, ISR, and SSG — all three are acceptable for SEO; client-only rendering is not.

**Acceptance criteria:**

- Disabling JavaScript in the browser still shows the full page content, including all text, images with alt, meta tags, and schema.
- View Source on any indexable page shows complete HTML, not just &lt;div id="root"&gt;&lt;/div&gt;.
- Schema markup, meta tags, OG tags, and canonical URLs are present in the initial HTML response (not injected by client JS).
- Google Search Console URL Inspection tool shows fully rendered HTML matching what users see.

**Critical note on Next.js rendering**

Next.js sites often have a hybrid rendering setup where some pages are SSR and others are CSR. For SEO, every indexable page must be in SSR, ISR, or SSG mode. Pages that legitimately need to be CSR-only (admin dashboards, customer portals) should have robotsIndex=false (REQ-006). The dev team should explicitly audit each route in the codebase and confirm its rendering mode.

**REQ-030 Incremental Static Regeneration for content pages**

**P2 — MEDIUM**

Service pages, city pages, portfolio entries, and blog posts should use ISR (Incremental Static Regeneration) for optimal performance — pages are statically generated at build time and revalidated periodically or on-demand when content changes.

**Acceptance criteria:**

- Content pages use revalidate or on-demand revalidation.
- Publishing content in the CMS triggers regeneration within 60 seconds.
- Pages serve from edge cache after first render.

# **6\. Performance and Core Web Vitals**

Google's Core Web Vitals are direct ranking signals. The bar Fine Element should hit on mobile (the dominant traffic channel for home services) is: LCP under 2.5 seconds, INP under 200ms, CLS under 0.1. These targets are achievable on a well-built Next.js site but require deliberate engineering.

**REQ-031 LCP under 2.5 seconds on mobile**

**P1 — HIGH**

Largest Contentful Paint must be under 2.5 seconds on a simulated 4G connection on a mid-tier mobile device (Moto G4 or equivalent), tested via Lighthouse mobile audit.

**Acceptance criteria:**

- Hero image on every page type is preloaded and marked priority.
- Hero image is served in WebP/AVIF with proper dimensions for mobile viewports.
- Critical CSS is inlined; non-critical CSS is deferred.
- Fonts use font-display: swap and are preloaded.
- Lighthouse mobile audit shows LCP < 2.5s on key page types (home, service, portfolio, blog).

**REQ-032 CLS under 0.1**

**P1 — HIGH**

Cumulative Layout Shift must be under 0.1 on every page. The most common offenders are images without dimensions, dynamically injected content above the fold, and web fonts.

**Acceptance criteria:**

- All images have explicit width and height attributes.
- Embedded videos and iframes have reserved space.
- Web fonts use font-display: swap to avoid invisible text but include fallback metrics adjustments to minimize layout shift.
- Banners, cookie notices, and chat widgets are loaded in a way that does not push content.

**REQ-033 INP under 200ms**

**P2 — MEDIUM**

Interaction to Next Paint must be under 200ms. This requires minimizing long JavaScript tasks and ensuring interactive elements respond quickly.

**Acceptance criteria:**

- Third-party scripts (chat widget, analytics, call tracking) load with strategy="afterInteractive" or "lazyOnload".
- Heavy interactive components are code-split.
- No main-thread JavaScript task exceeds 50ms.
- Lighthouse mobile audit shows INP under 200ms.

**REQ-034 Third-party script management**

**P1 — HIGH**

Third-party scripts (Google Analytics, GTM, call tracking, chat widgets, social pixels, Houzz badges) must be loaded via Next.js Script component with appropriate strategy, and must be controllable through the CMS without code deploys.

**Fields required:**

- **scripts** — Collection of { name, src, strategy, location, conditions }

**Acceptance criteria:**

- Operator can add/remove scripts through the CMS.
- Each script has a strategy (beforeInteractive, afterInteractive, lazyOnload) configurable in the CMS.
- GTM is loaded so all other tags can be managed from a single place — ideal pattern for SEO/marketing autonomy.

# **7\. Hreflang and Localization**

Fine Element currently serves a US English audience only, so hreflang is not strictly required. However, the infrastructure should be specified so that if Spanish-language pages are added in the future (the Greater Seattle market has a meaningful Spanish-speaking homeowner segment), the implementation does not require ripping up the architecture.

**REQ-035 Hreflang field architecture**

**P3 — NICE TO HAVE**

Each page must support a hreflang field collection allowing the operator to declare alternate language versions if/when added. For now this can be unused, but the field must exist.

**Fields required:**

- **alternateLanguages** — Collection of { language: ISO code, url: String }

**Acceptance criteria:**

- If alternateLanguages is populated, the page renders &lt;link rel="alternate" hreflang="..."&gt; tags in &lt;head&gt;.
- If empty, no hreflang tags are rendered.
- If populated, x-default link is also rendered.

# **8\. CMS Workflow and Publishing**

Beyond the per-field requirements above, the CMS as a whole must support workflows that an SEO operator (not a developer) can run without help. This section is about the operator experience, not the rendered HTML.

**REQ-036 Preview mode for unpublished changes**

**P1 — HIGH**

The CMS must support previewing draft content as it will appear once published, before publishing. Preview URLs should require auth and not be indexable.

**Acceptance criteria:**

- Operator can preview draft pages via authenticated preview URLs.
- Preview URLs include noindex meta and X-Robots-Tag: noindex header.
- Preview URLs are tokenized so they are not guessable.

**REQ-037 Scheduled publishing**

**P2 — MEDIUM**

Pages and posts must support scheduled publish and unpublish dates.

**Fields required:**

- **publishAt** — Optional datetime — if future, page is not live until then
- **unpublishAt** — Optional datetime — if past, page is taken down

**Acceptance criteria:**

- Pages scheduled for future publish do not appear in sitemap until live.
- Pages with unpublishAt in the past return 410 Gone or 404 and are removed from sitemap.

**REQ-038 Content versioning and audit log**

**P2 — MEDIUM**

The CMS must keep version history of all content changes with an audit log showing who changed what and when. Operators must be able to revert to previous versions.

**Acceptance criteria:**

- Each save creates a version snapshot.
- Audit log shows user, timestamp, fields changed.
- Operator can compare and revert to any prior version.

**REQ-039 Bulk operations for SEO fields**

**P2 — MEDIUM**

For efficiency, the CMS must support bulk-editing SEO fields across multiple pages. Example: "set this meta description template across all 15 city pages" should be doable without editing each one.

**Acceptance criteria:**

- Operator can select multiple pages and apply a field template.
- Bulk operations have an undo or are versioned for safety.

**REQ-040 Role-based access for marketing operators**

**P1 — HIGH**

The CMS must support a Marketing Operator role that can edit content, SEO fields, and the redirect table, but cannot change site structure, page templates, or code.

**Acceptance criteria:**

- Marketing Operator role exists with scoped permissions.
- Permissions are documented and tested.
- Operator role cannot delete pages without a confirmation step.

# **9\. Content Type Schemas**

Beyond the global SEO requirements above, the CMS must support these specific content types. Each must include the standard SEO field set (meta title, description, slug, OG, schema overrides, canonical, robots) plus the type-specific fields below.

## **Service page**

- Service name, slug, hero image, hero video (optional)
- Short description (above the fold)
- Long description (rich text)
- "What's included" checklist (editable list)
- Process steps (editable list)
- Featured portfolio entries (relation to portfolio collection)
- FAQ items (REQ-012)
- Service categories for schema (REQ-010)
- CTAs (primary, secondary)

## **Portfolio entry**

- Project title, slug
- Service type (relation to service collection)
- City (relation to city collection — enables filtering for city pages)
- Neighborhood (free-form text)
- Project description (rich text)
- Before/after image pairs (collection, each with alt text per REQ-016)
- Gallery (additional images)
- Project duration
- Materials and brands used (controlled vocabulary)
- Client testimonial (optional, relation to reviews)
- Featured flag (boolean — controls homepage appearance)

## **City page**

- City name, slug
- Service (relation to service collection — one city page per service+city combo)
- Hero image, hero copy
- Local context paragraph (neighborhoods served, local design considerations)
- Featured portfolio entries filtered by city (query relation)
- Local testimonials filtered by city
- Embedded map of service area
- Permit/process information specific to that jurisdiction
- FAQ items specific to that city
- Internal links to related city pages and parent service page

## **Blog post**

- Title, slug
- Author (relation to author collection)
- Published date, modified date (auto)
- Featured image with alt
- Excerpt
- Body (rich text with shortcodes for images, embeds, FAQs)
- Categories and tags
- Related posts (auto or manual)
- Article schema (REQ-014)

## **Testimonial / review**

- Author name
- City (relation)
- Project type (relation to service)
- Rating (1–5)
- Review body
- Date published
- Source platform (Google, Houzz, Yelp, direct)
- Featured flag

# **10\. Analytics and Conversion Tracking Infrastructure**

The SEO program is accountable to lead generation outcomes. The backend must support accurate analytics and conversion tracking without requiring a developer to add or modify tags for each new campaign.

**REQ-041 Google Tag Manager container loaded site-wide**

**P0 — CRITICAL**

GTM must be loaded site-wide via the Next.js Script component. All other tracking tags (GA4, Meta Pixel, LSA conversion, call tracking, retargeting pixels) are then managed in GTM by the marketing operator without code deploys.

**Acceptance criteria:**

- GTM container ID is configurable in the CMS (environment variable acceptable for staging vs production).
- GTM script loads with appropriate strategy.
- DataLayer is initialized before GTM loads.
- Server-side GTM is recommended but not required at this stage.

**REQ-042 Conversion event dataLayer pushes**

**P0 — CRITICAL**

Key conversion events on the site must push structured events to the dataLayer so GTM/GA4 can capture them. The development team must implement, the marketing team configures downstream.

**Acceptance criteria:**

- Form submission (estimate request, contact, financing) → dataLayer.push({event: 'form_submit', form_name, page_path})
- Phone number click (tel: link) → dataLayer.push({event: 'phone_click', phone_number})
- Calendly booking confirmation → dataLayer.push({event: 'consultation_booked'})
- Financing CTA click → dataLayer.push({event: 'financing_cta_click'})
- Portfolio image expand → dataLayer.push({event: 'portfolio_engagement', project_name})

**REQ-043 Call tracking integration support**

**P0 — CRITICAL**

The site must support dynamic number insertion (DNI) from a call tracking platform such as CallRail. Phone numbers displayed on the site must be swappable per visitor source via JavaScript injection.

**Acceptance criteria:**

- The phone number is rendered with a swappable class or data attribute (e.g. &lt;a class="phone-tracking" href="tel:..."&gt;).
- CallRail or equivalent script can override the displayed and href phone number based on UTM parameters and referrer.
- Server-rendered initial phone number is the default master number (single source of truth from REQ-009).
- All phone occurrences (header, footer, hero, CTAs) use the same trackable component — no hardcoded duplicates.

**REQ-044 UTM parameter preservation across navigation**

**P2 — MEDIUM**

Inbound UTM parameters (utm_source, utm_medium, utm_campaign, gclid, fbclid) must be preserved as the visitor navigates the site, so that the form submission or phone call source can be correctly attributed.

**Acceptance criteria:**

- UTM params persist as URL query strings or session storage across pages.
- Form submissions include the original entry UTM params as hidden fields.
- Click-to-call tracking captures the original UTM params.

# **11\. Accessibility (a11y)**

Accessibility is both a legal requirement (ADA Title III compliance is increasingly enforced for service business websites) and a direct contributor to SEO — Google's algorithms reward sites that semantic HTML, ARIA, and keyboard navigation correctly. The current site should be audited against WCAG 2.2 AA.

**REQ-045 WCAG 2.2 AA compliance**

**P1 — HIGH**

The site must comply with WCAG 2.2 Level AA. Specifically: semantic HTML (header, nav, main, article, section, footer), keyboard navigation for all interactive elements, sufficient color contrast (4.5:1 for normal text), ARIA labels on icon-only buttons, accessible forms with labels, skip-to-content link, visible focus states.

**Acceptance criteria:**

- Lighthouse Accessibility audit scores 95+ on all key page types.
- axe DevTools shows no critical or serious issues on key pages.
- Manual keyboard navigation test passes: every interactive element reachable and operable via keyboard.
- Screen reader test (NVDA or VoiceOver) renders the site usably.

# **Requirements Summary**

All 45 requirements consolidated for easy reference and sprint planning.

| **ID**      | **Requirement**                                    | **Priority** |
| ----------- | -------------------------------------------------- | ------------ |
| **REQ-001** | Editable meta title per page                       | **P0**       |
| **REQ-002** | Editable meta description per page                 | **P0**       |
| **REQ-003** | Editable H1 separated from page title              | **P0**       |
| **REQ-004** | Editable URL slug per page                         | **P0**       |
| **REQ-005** | Editable canonical URL per page                    | **P1**       |
| **REQ-006** | Editable robots directives per page                | **P1**       |
| **REQ-007** | Open Graph fields per page                         | **P1**       |
| **REQ-008** | Twitter Card fields per page                       | **P2**       |
| **REQ-009** | Site-wide LocalBusiness schema                     | **P0**       |
| **REQ-010** | Service schema on service pages                    | **P0**       |
| **REQ-011** | AggregateRating and Review schema                  | **P1**       |
| **REQ-012** | FAQ schema for FAQ blocks                          | **P1**       |
| **REQ-013** | BreadcrumbList schema                              | **P1**       |
| **REQ-014** | Article schema on blog posts                       | **P2**       |
| **REQ-015** | Per-page custom JSON-LD escape hatch               | **P2**       |
| **REQ-016** | Editable alt text on every image                   | **P0**       |
| **REQ-017** | Editable image title and caption                   | **P2**       |
| **REQ-018** | Descriptive image filenames                        | **P1**       |
| **REQ-019** | Next.js Image component with responsive sizing     | **P0**       |
| **REQ-020** | OG / social card image generation                  | **P2**       |
| **REQ-021** | Domain consolidation — single canonical host       | **P0**       |
| **REQ-022** | Trailing slash policy enforced                     | **P1**       |
| **REQ-023** | Lowercase URL enforcement                          | **P1**       |
| **REQ-024** | CMS-managed redirect table                         | **P0**       |
| **REQ-025** | Custom 404 with proper status code                 | **P1**       |
| **REQ-026** | Dynamically generated XML sitemap                  | **P0**       |
| **REQ-027** | Sitemap index for scalability                      | **P3**       |
| **REQ-028** | Editable robots.txt                                | **P1**       |
| **REQ-029** | Server-side rendering for indexable pages          | **P0**       |
| **REQ-030** | ISR for content pages                              | **P2**       |
| **REQ-031** | LCP under 2.5 seconds on mobile                    | **P1**       |
| **REQ-032** | CLS under 0.1                                      | **P1**       |
| **REQ-033** | INP under 200ms                                    | **P2**       |
| **REQ-034** | Third-party script management via Script component | **P1**       |
| **REQ-035** | Hreflang field architecture                        | **P3**       |
| **REQ-036** | Preview mode for unpublished changes               | **P1**       |
| **REQ-037** | Scheduled publishing                               | **P2**       |
| **REQ-038** | Content versioning and audit log                   | **P2**       |
| **REQ-039** | Bulk operations for SEO fields                     | **P2**       |
| **REQ-040** | Role-based access for marketing operators          | **P1**       |
| **REQ-041** | Google Tag Manager site-wide                       | **P0**       |
| **REQ-042** | Conversion event dataLayer pushes                  | **P0**       |
| **REQ-043** | Call tracking integration support                  | **P0**       |
| **REQ-044** | UTM parameter preservation                         | **P2**       |
| **REQ-045** | WCAG 2.2 AA compliance                             | **P1**       |