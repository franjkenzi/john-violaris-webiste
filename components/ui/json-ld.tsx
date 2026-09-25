import { serializeJsonLd, type JsonLdGraph } from "@/lib/cms/seo/json-ld";

/**
 * A page's structured data.
 *
 * A plain `<script>`, not `next/script`: this is data for crawlers, not code to
 * load, and the Next.js JSON-LD guide recommends rendering it in the page.
 */
export function JsonLd({ data }: { data: JsonLdGraph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
