/**
 * Checks every public page's structured data against a running server.
 *
 *   node scripts/verify-structured-data.mjs [base-url]
 *
 * The base URL defaults to http://localhost:3000; point it at a production
 * build (`next build` + `next start`) or at staging. Every route in the
 * sitemap is fetched and its JSON-LD checked — SEO requirement REQ-019, which
 * asks for broken schema to be caught before traffic is lost rather than after.
 *
 * What it checks, per page:
 *
 *  - One JSON-LD block, and it parses.
 *  - Every type and property exists in the Schema.org vocabulary, and each
 *    property is one Schema.org allows on that type. The vocabulary is
 *    downloaded once and kept in `node_modules/.cache`.
 *  - No empty values: nothing unset is emitted as "", null or [] (REQ-010).
 *  - Every `@id` reference points at a node in the same graph (REQ-017), and
 *    no `@id` is declared twice.
 *  - The website, the practice and John on every page, and one WebPage whose
 *    `@id` is this page's.
 *  - A breadcrumb on every page but home, numbered from 1, matching the trail
 *    printed on the page (REQ-014).
 *  - At most one FAQPage, and every question in it visible on the page
 *    (REQ-013).
 *  - Service pages carry a Service, articles a BlogPosting by John (REQ-012,
 *    REQ-015).
 *
 * It does not replace the Google Rich Results Test, which REQ-019 still asks
 * for by hand before launch; it catches regressions between those checks.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const site = "https://johnviolaris.com";
const vocabularyUrl =
  "https://schema.org/version/latest/schemaorg-current-https.jsonld";
const cacheFile = join(
  dirname(fileURLToPath(import.meta.url)),
  "../node_modules/.cache/schemaorg-current-https.jsonld",
);

// ---------------------------------------------------------------------------
// The vocabulary
// ---------------------------------------------------------------------------

async function loadVocabulary() {
  if (!existsSync(cacheFile)) {
    const response = await fetch(vocabularyUrl);

    if (!response.ok) {
      throw new Error(`Could not download the Schema.org vocabulary: ${response.status}`);
    }

    mkdirSync(dirname(cacheFile), { recursive: true });
    writeFileSync(cacheFile, await response.text());
  }

  const vocabulary = JSON.parse(readFileSync(cacheFile, "utf8"));
  const local = (value) => String(value["@id"] ?? value).replace(/^schema:/, "");
  const list = (value) => (value === undefined ? [] : [].concat(value));

  /** Type name → its direct parents. */
  const classes = new Map();
  /** Property name → the types it may be used on. */
  const properties = new Map();

  for (const term of vocabulary["@graph"]) {
    const kinds = list(term["@type"]);

    if (kinds.includes("rdfs:Class")) {
      classes.set(local(term), list(term["rdfs:subClassOf"]).map(local));
    }

    if (kinds.includes("rdf:Property")) {
      properties.set(
        local(term),
        new Set(list(term["schema:domainIncludes"]).map(local)),
      );
    }
  }

  /** A type and everything it inherits from. */
  function lineage(type) {
    const seen = new Set();
    const queue = [type];

    while (queue.length > 0) {
      const next = queue.shift();

      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...(classes.get(next) ?? []));
    }

    return seen;
  }

  return { classes, properties, lineage };
}

// ---------------------------------------------------------------------------
// Reading a page
// ---------------------------------------------------------------------------

function decode(html) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Text of an HTML fragment, tags removed and whitespace collapsed. */
function text(html) {
  return decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/**
 * The page with every script removed. The markup and the RSC payload both
 * repeat the page's words, so anything "visible" must be found without them.
 */
function visibleHtml(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}

// ---------------------------------------------------------------------------
// Checking
// ---------------------------------------------------------------------------

function isReference(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    "@id" in value
  );
}

function checkPage(path, html, vocabulary) {
  const problems = [];
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((match) => match[1]);

  if (blocks.length !== 1) {
    return [`expected one JSON-LD block, found ${blocks.length}`];
  }

  let data;

  try {
    data = JSON.parse(blocks[0]);
  } catch (error) {
    return [`JSON-LD does not parse: ${error.message}`];
  }

  if (data["@context"] !== "https://schema.org") {
    problems.push(`@context is ${JSON.stringify(data["@context"])}`);
  }

  const nodes = data["@graph"] ?? [];
  const ids = new Map();
  const references = [];

  // Every object in the graph, nested ones included.
  function walk(value, where) {
    if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      problems.push(`${where} is empty`);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${where}[${index}]`));
      return;
    }

    if (typeof value !== "object") return;

    if (isReference(value)) {
      references.push({ id: value["@id"], where });
      return;
    }

    const types = [].concat(value["@type"] ?? []);

    if (types.length === 0) {
      problems.push(`${where} has no @type`);
    }

    const lineages = types.map((type) => {
      if (!vocabulary.classes.has(type)) {
        problems.push(`${where}: unknown type ${type}`);
      }

      return vocabulary.lineage(type);
    });

    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith("@")) continue;

      const domains = vocabulary.properties.get(key);

      if (!domains) {
        problems.push(`${where}: unknown property ${key}`);
      } else if (
        !lineages.some((lineage) => [...domains].some((domain) => lineage.has(domain)))
      ) {
        problems.push(`${where}: ${key} is not a property of ${types.join("/")}`);
      }

      walk(child, `${where}.${key}`);
    }
  }

  for (const node of nodes) {
    const id = node["@id"];

    if (id) {
      if (ids.has(id)) problems.push(`@id declared twice: ${id}`);
      ids.set(id, node);
    }
  }

  nodes.forEach((node, index) =>
    walk(node, `${[].concat(node["@type"]).join("/")}#${index}`),
  );

  for (const { id, where } of references) {
    if (!ids.has(id)) problems.push(`${where} points at ${id}, which is not in the graph`);
  }

  // The nodes every page carries.
  const expect = (id, type) => {
    const node = ids.get(id);

    if (!node || ![].concat(node["@type"]).includes(type)) {
      problems.push(`missing ${type} ${id}`);
    }

    return node;
  };

  expect(`${site}/#website`, "WebSite");
  expect(`${site}/#practice`, "LegalService");
  expect(`${site}/#john`, "Person");

  const pageUrl = new URL(path, site).href;
  const webPage = ids.get(`${pageUrl}#webpage`);

  if (!webPage) problems.push(`no WebPage node for ${pageUrl}`);

  const typed = (type) =>
    nodes.filter((node) => [].concat(node["@type"]).includes(type));

  if (typed("FAQPage").length > 1) problems.push("more than one FAQPage");

  const visible = visibleHtml(html);
  const visibleText = text(visible);

  for (const faq of typed("FAQPage")) {
    for (const question of faq.mainEntity ?? []) {
      if (!visibleText.includes(question.name)) {
        problems.push(`FAQ question not on the page: ${question.name}`);
      }

      if (!visibleText.includes(question.acceptedAnswer?.text)) {
        problems.push(`FAQ answer not on the page: ${question.name}`);
      }
    }
  }

  // The breadcrumb, against the trail printed above the heading.
  const breadcrumbs = typed("BreadcrumbList");

  if (path === "/") {
    if (breadcrumbs.length > 0) problems.push("the home page has a breadcrumb");
  } else if (breadcrumbs.length !== 1) {
    problems.push(`expected one BreadcrumbList, found ${breadcrumbs.length}`);
  } else {
    const items = breadcrumbs[0].itemListElement ?? [];
    const names = items.map((item) => item.name);

    items.forEach((item, index) => {
      if (item.position !== index + 1) {
        problems.push(`breadcrumb item ${index} has position ${item.position}`);
      }

      if (!String(item.item).startsWith(`${site}/`)) {
        problems.push(`breadcrumb item ${item.name} is not on ${site}`);
      }
    });

    if (items.at(-1)?.item !== pageUrl) {
      problems.push(`breadcrumb does not end at the page itself`);
    }

    const printed = visible.match(/class="breadcrumb"[^>]*>([\s\S]*?)<\/a>/);
    const trail = printed ? text(printed[1]).split(" / ") : [];
    const heading = text(visible.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");

    // The printed trail, then at most the page itself, named as its heading.
    const matches =
      trail.every((name, index) => names[index] === name) &&
      (names.length === trail.length ||
        (names.length === trail.length + 1 && names.at(-1) === heading));

    if (!matches) {
      problems.push(
        `breadcrumb ${JSON.stringify(names)} does not match the page's ${JSON.stringify(trail)}`,
      );
    }
  }

  if (path.startsWith("/services/") && typed("Service").length !== 1) {
    problems.push("a service page without a Service");
  }

  if (path.startsWith("/blog/")) {
    const [article] = typed("BlogPosting");

    if (!article) {
      problems.push("an article without a BlogPosting");
    } else if (article.author?.["@id"] !== `${site}/#john`) {
      problems.push("the article's author is not John");
    }
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const vocabulary = await loadVocabulary();
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => new URL(match[1]).pathname,
);

if (paths.length === 0) {
  console.error(`No routes in ${base}/sitemap.xml`);
  process.exit(1);
}

let failures = 0;

for (const path of paths) {
  const response = await fetch(`${base}${path}`);
  const problems = response.ok
    ? checkPage(path, await response.text(), vocabulary)
    : [`HTTP ${response.status}`];

  console.log(`  ${problems.length === 0 ? "ok  " : "FAIL"}  ${path}`);

  for (const problem of problems) console.log(`        ${problem}`);

  if (problems.length > 0) failures += 1;
}

console.log(
  failures === 0
    ? `\nAll ${paths.length} pages passed.`
    : `\n${failures} of ${paths.length} pages failed.`,
);

process.exit(failures === 0 ? 0 : 1);
