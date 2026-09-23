/**
 * Checks the order in which a page's metadata is decided.
 *
 *   node --import ./scripts/alias-hook.mjs scripts/verify-seo.mjs
 *
 * SEO requirement REQ-009 asks for this to be tested rather than trusted: with
 * the root layout, a route's defaults and a saved override all able to set
 * the same tag, a wrong title is otherwise a guessing game. The cases below
 * are the four it names — every layer set, defaults only, an override that is
 * blank, no override at all — plus the rules the sitemap depends on.
 *
 * `resolveMetadata` is pure, so this needs no database and no server.
 */
import { belongsInSitemap, resolveMetadata } from "@/lib/cms/seo/resolve.ts";

const site = "https://johnviolaris.com";
const name = "John Violaris";

const defaults = {
  title: "Drink Driving Solicitor",
  description: "The page's own standfirst.",
};

let failures = 0;

function expect(label, actual, wanted) {
  const ok = JSON.stringify(actual) === JSON.stringify(wanted);

  if (!ok) failures += 1;

  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}`);

  if (!ok) {
    console.log(`        got:    ${JSON.stringify(actual)}`);
    console.log(`        wanted: ${JSON.stringify(wanted)}`);
  }
}

// Defaults only: the route's own words, a self-referencing canonical, and a
// share title carrying the site's name as Next's own inheritance did.
const plain = resolveMetadata("/services/drink-driving", defaults, null, name);

expect("no override: title is the default", plain.title, defaults.title);
expect("no override: description is the default", plain.description, defaults.description);
expect("no override: canonical is the page itself", plain.alternates.canonical, "/services/drink-driving");
expect("no override: share title adds the name", plain.openGraph.title, "Drink Driving Solicitor | John Violaris");
expect("no override: og:url is the page, not the home page", plain.openGraph.url, "/services/drink-driving");
expect("no override: site name and locale are always set", [plain.openGraph.siteName, plain.openGraph.locale], [name, "en_GB"]);
expect("no override: robots is inherited, not replaced", "robots" in plain, false);

// Every layer set: the override wins field by field.
const full = resolveMetadata(
  "/services/drink-driving",
  defaults,
  {
    title: "Custom title",
    description: "Custom description.",
    canonical: "/services/speeding",
    ogTitle: "Share title",
    ogDescription: "Share description.",
    ogImage: "https://example.com/share.png",
    ogImageAlt: "A description",
    noIndex: true,
  },
  name,
);

expect("override: title", full.title, "Custom title");
expect("override: description", full.description, "Custom description.");
expect("override: canonical and og:url follow it", [full.alternates.canonical, full.openGraph.url], ["/services/speeding", "/services/speeding"]);
expect("override: share title used exactly as written", full.openGraph.title, "Share title");
expect("override: share description", full.openGraph.description, "Share description.");
expect("override: share image with its description", full.openGraph.images, [{ url: "https://example.com/share.png", alt: "A description" }]);
expect("override: noindex keeps follow", full.robots, { index: false, follow: true });

// An override that is present but blank falls through — it never renders an
// empty tag.
const blank = resolveMetadata(
  "/services/drink-driving",
  defaults,
  { title: "   ", description: "", ogTitle: " " },
  name,
);

expect("blank override: title falls back", blank.title, defaults.title);
expect("blank override: description falls back", blank.description, defaults.description);
expect("blank override: share title falls back", blank.openGraph.title, "Drink Driving Solicitor | John Violaris");

// A share title that overrides only the search title still follows it.
const titled = resolveMetadata("/about", { title: "About John" }, { title: "Meet John" }, name);

expect("search title only: share title follows it", titled.openGraph.title, "Meet John | John Violaris");
expect("no description anywhere: no empty tag", ["description" in titled, "description" in titled.openGraph], [false, false]);

// Articles share the headline alone and keep their date and featured image.
const article = resolveMetadata(
  "/blog/laced-drinks",
  {
    title: "Laced drinks",
    ogType: "article",
    publishedTime: "2026-09-01T09:00:00Z",
    image: { url: "https://example.com/featured.jpg", alt: "Featured" },
  },
  null,
  name,
);

expect("article: headline alone", article.openGraph.title, "Laced drinks");
expect("article: type and date", [article.openGraph.type, article.openGraph.publishedTime], ["article", "2026-09-01T09:00:00Z"]);
expect("article: featured image by default", article.openGraph.images, [{ url: "https://example.com/featured.jpg", alt: "Featured" }]);

// The sitemap's rules.
expect("sitemap: an ordinary page is listed", belongsInSitemap("/fees", null, site), true);
expect("sitemap: a hidden page is not", belongsInSitemap("/fees", { noIndex: true }, site), false);
expect("sitemap: a page canonical elsewhere is not", belongsInSitemap("/fees", { canonical: "/services" }, site), false);
expect("sitemap: a canonical to itself, absolute, is fine", belongsInSitemap("/fees", { canonical: "https://johnviolaris.com/fees" }, site), true);

console.log(
  failures === 0
    ? "\nMetadata resolves in the documented order."
    : `\n${failures} check(s) failed.`,
);

process.exit(failures === 0 ? 0 : 1);
