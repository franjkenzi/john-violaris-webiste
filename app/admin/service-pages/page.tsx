import type { Metadata } from "next";
import Link from "next/link";
import { FolderTree } from "lucide-react";

import { ClickableRow } from "@/components/admin/clickable-row";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { listServicePages, listServices } from "@/lib/cms/admin-queries";
import { setServicePagePublished } from "@/lib/cms/service-pages/actions";
import { servicePath } from "@/lib/cms/services/schema";
import { formatUkShortDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Service pages",
};

export default async function AdminServicePagesPage() {
  const [services, pages] = await Promise.all([
    listServices(),
    listServicePages(),
  ]);

  // Police station representation links to a page of its own, which has no
  // offence page to write. It is named in the note below instead.
  const withPages = services.filter((service) => !service.content.href);
  const ownPages = services.filter((service) => service.content.href);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Service pages</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The long-form page for each offence: the heading, the at-a-glance
          cards, the points John examines and the outcome tables. A page is
          only visible while both it and its service are published — a service
          with no published page still has a page, showing general copy about
          how John can help.
        </p>
      </header>

      {withPages.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <FolderTree className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No services yet.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Pages belong to services. Add one under{" "}
            <Link href="/admin/services" className="underline underline-offset-4">
              Services
            </Link>{" "}
            first.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <caption className="sr-only">
              Offence pages, in the order their services appear on the site
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
                  Heading
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Last edited
                </th>
              </tr>
            </thead>
            <tbody>
              {withPages.map((service) => {
                const page = pages[service.id];
                const href = `/admin/service-pages/${service.id}`;

                return (
                  <ClickableRow key={service.id} href={href}>
                    <td className="px-4 py-3 align-top">
                      {page ? (
                        <PublishToggle
                          id={page.id}
                          label={`the ${service.name} page`}
                          published={page.published}
                          action={setServicePagePublished}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not written
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={href}
                        className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                      >
                        {service.name}
                      </Link>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {servicePath(service)}
                        {service.published ? "" : " · service is a draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {page?.headline ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
                      {page ? (
                        <time dateTime={page.updated_at}>
                          {formatUkShortDateTime(page.updated_at)}
                        </time>
                      ) : (
                        "—"
                      )}
                    </td>
                  </ClickableRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ownPages.length > 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {ownPages.map((service) => service.name).join(", ")}{" "}
          {ownPages.length === 1
            ? "has a page of its own"
            : "have pages of their own"}
          , edited under{" "}
          <Link
            href="/admin/website-content/police-station"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Website content
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
