import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";

import { ClickableRow } from "@/components/admin/clickable-row";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { RowReorder } from "@/components/admin/row-reorder";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { listServicePages, listServices } from "@/lib/cms/admin-queries";
import { moveService, setServicePublished } from "@/lib/cms/services/actions";
import { servicePath } from "@/lib/cms/services/schema";
import type { ServiceRow } from "@/lib/cms/types";

export const metadata: Metadata = {
  title: "Services",
};

/**
 * Rows grouped the way the site groups them: by heading, in the order each
 * group's first member appears. The same rule as `toServiceGroups`, so the
 * list reads in the order the mega-menu does.
 */
function groupRows(rows: ServiceRow[]) {
  const groups = new Map<string, ServiceRow[]>();

  for (const row of rows) {
    const heading = row.content.group;
    groups.set(heading, [...(groups.get(heading) ?? []), row]);
  }

  return [...groups.entries()];
}

export default async function AdminServicesPage() {
  const [services, pages] = await Promise.all([
    listServices(),
    listServicePages(),
  ]);

  const groups = groupRows(services);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Services</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The catalogue behind the services menu, the services page, the
            footer and the rail of common charges beneath the hero. Each group
            here is a column in the menu. The long-form page for each offence
            is edited under{" "}
            <Link
              href="/admin/service-pages"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Service pages
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          <Plus aria-hidden="true" />
          Add service
        </Link>
      </header>

      {groups.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <BriefcaseBusiness
            className="size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">No services yet.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add the first one and it will appear in the services menu once
            published.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([heading, rows], groupIndex) => (
            <section key={heading} aria-labelledby={`group-${groupIndex}`}>
              <h2
                id={`group-${groupIndex}`}
                className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
              >
                {heading}
              </h2>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[52rem] border-collapse text-sm">
                  <caption className="sr-only">
                    {heading}, in the order they appear on the site
                  </caption>
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th scope="col" className="w-28 px-4 py-2.5 font-medium">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Service
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Reference line
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Hero rail
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Offence page
                      </th>
                      <th scope="col" className="w-24 px-4 py-2.5 font-medium">
                        <span className="sr-only">Reorder</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((service, index) => {
                      const page = pages[service.id];

                      return (
                        <ClickableRow
                          key={service.id}
                          href={`/admin/services/${service.id}`}
                        >
                          <td className="px-4 py-3 align-top">
                            <PublishToggle
                              id={service.id}
                              label={service.name}
                              published={service.published}
                              action={setServicePublished}
                            />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <Link
                              href={`/admin/services/${service.id}`}
                              className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                            >
                              {service.name}
                            </Link>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {servicePath(service)}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top text-muted-foreground">
                            {service.content.statute ?? "—"}
                          </td>
                          <td className="px-4 py-3 align-top text-muted-foreground">
                            {service.content.featured
                              ? (service.content.short ?? "Shown")
                              : "—"}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <PageStatus service={service} page={page} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <RowReorder
                              id={service.id}
                              label={service.name}
                              isFirst={index === 0}
                              isLast={index === rows.length - 1}
                              action={moveService}
                            />
                          </td>
                        </ClickableRow>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        The arrows move a service within its group. A service moved to another
        group goes to the end of it, and a new group appears at the end of the
        menu.
      </p>
    </div>
  );
}

/**
 * Where the offence page stands, as a link to it.
 *
 * Police station representation links to a page of its own rather than an
 * offence page, and says so instead of offering to write one it would never
 * show.
 */
function PageStatus({
  service,
  page,
}: {
  service: ServiceRow;
  page: { published: boolean } | undefined;
}) {
  if (service.content.href) {
    return <span className="text-muted-foreground">Its own page</span>;
  }

  return (
    <Link
      href={`/admin/service-pages/${service.id}`}
      className="underline-offset-4 hover:underline focus-visible:underline"
    >
      {page ? (
        page.published ? (
          "Published"
        ) : (
          <span className="text-muted-foreground">Draft</span>
        )
      ) : (
        <span className="text-muted-foreground">Not written</span>
      )}
    </Link>
  );
}
