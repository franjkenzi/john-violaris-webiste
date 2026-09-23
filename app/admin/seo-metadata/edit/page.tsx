import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoForm } from "@/components/admin/seo-form";
import { getSeoRow } from "@/lib/cms/admin-queries";
import { getSiteConfig } from "@/lib/cms/queries";
import { defaultShareImage, titleSuffix } from "@/lib/cms/seo/resolve";
import { findSeoRoute } from "@/lib/cms/seo/routes";
import { seoValuesFrom } from "@/lib/cms/seo/schema";
import { formatUkShortDateTime } from "@/lib/format";
import { deployment } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Edit SEO",
};

/**
 * One page's SEO, addressed by its path in the query string.
 *
 * A query parameter rather than a route segment, because the thing being
 * edited is itself a path — `/services/drink-driving` — and nesting that under
 * `/admin/seo-metadata/` would make the home page's `/` unaddressable.
 */
export default async function EditSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string | string[] }>;
}) {
  const { path: raw } = await searchParams;
  const path = typeof raw === "string" ? raw : "";

  const [route, row, config] = await Promise.all([
    findSeoRoute(path),
    getSeoRow(path),
    getSiteConfig(),
  ]);

  if (!route) notFound();

  const content = row?.content ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          SEO · {route.group}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          {route.label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-mono">{route.path}</span>
          {" · "}
          {row ? (
            <>
              Customised, last saved{" "}
              <time dateTime={row.updated_at}>
                {formatUkShortDateTime(row.updated_at)}
              </time>
              .
            </>
          ) : (
            "Using the page’s defaults."
          )}
        </p>
      </header>

      <SeoForm
        // Keyed by path so moving between two pages rebuilds the editor rather
        // than carrying one page's typing into the next.
        key={route.path}
        path={route.path}
        label={route.label}
        url={new URL(route.path, deployment.url).href}
        defaults={route.defaults}
        values={seoValuesFrom(content)}
        noIndex={content?.noIndex === true}
        noFollow={content?.noFollow === true}
        customised={Boolean(row)}
        suffix={titleSuffix(config.name)}
        fallbackImage={defaultShareImage(config.name, config.role).url}
      />
    </div>
  );
}
