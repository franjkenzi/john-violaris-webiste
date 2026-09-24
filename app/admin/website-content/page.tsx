import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { listEditedSections } from "@/lib/cms/admin-queries";
import { pageGroups } from "@/lib/cms/sections/schema";
import { formatUkShortDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Website content",
};

export default async function AdminWebsiteContentPage() {
  const edited = await listEditedSections();

  // `page/section` rather than nested maps: the key is a pair everywhere else
  // in this feature, and flattening it here keeps the lookup below a lookup.
  const editedAt = new Map(
    edited.map((row) => [`${row.page}/${row.section}`, row.updated_at]),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Website content</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The wording on the main pages — headings, introductions, the cards and
          the steps. Services and articles are managed in their own sections.
          Anything you have not edited shows the wording the site was built
          with.
        </p>
      </header>

      <div className="space-y-8">
        {pageGroups.map((group) => (
          <section key={group.key} aria-labelledby={`group-${group.key}`}>
            <div className="mb-3">
              <h2
                id={`group-${group.key}`}
                className="font-display text-lg font-semibold"
              >
                {group.label}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {group.description}
              </p>
            </div>

            <ul className="divide-y rounded-xl border">
              {group.sections.map((section) => {
                const changed = editedAt.get(`${group.key}/${section.key}`);

                return (
                  <li key={section.key}>
                    <Link
                      href={`/admin/website-content/${group.key}#${section.key}`}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {section.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {section.description}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {changed ? (
                          <span className="text-xs whitespace-nowrap text-muted-foreground">
                            Edited {formatUkShortDateTime(changed)}
                          </span>
                        ) : (
                          <span className="text-xs whitespace-nowrap text-muted-foreground">
                            Original wording
                          </span>
                        )}
                        <ArrowRight
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
