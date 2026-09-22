import type { Metadata } from "next";
import Link from "next/link";
import { BadgePoundSterling, Plus } from "lucide-react";

import { ClickableRow } from "@/components/admin/clickable-row";
import { FeeReorder } from "@/components/admin/fee-reorder";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { listFees } from "@/lib/cms/admin-queries";
import { setFeePublished } from "@/lib/cms/fees/actions";

export const metadata: Metadata = {
  title: "Fees",
};

export default async function AdminFeesPage() {
  const fees = await listFees();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Fees</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The fee schedule on the fees page. Each one shows as a card and as a
            row in the full table beneath. Unpublish a fee to take it off the
            site without losing it.
          </p>
        </div>
        <Link
          href="/admin/fees/new"
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          <Plus aria-hidden="true" />
          Add fee
        </Link>
      </header>

      {fees.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <BadgePoundSterling
            className="size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">No fees yet.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add the first one and it will appear on the fees page once
            published.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <caption className="sr-only">
              Fees, in the order they appear on the site
            </caption>
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Fee
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Includes
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  <span className="sr-only">Reorder</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, index) => (
                <ClickableRow key={fee.id} href={`/admin/fees/${fee.id}`}>
                  <td className="px-4 py-3 align-top">
                    <PublishToggle
                      id={fee.id}
                      label={fee.title}
                      published={fee.published}
                      action={setFeePublished}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/fees/${fee.id}`}
                      className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                    >
                      {fee.title}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {fee.content.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap tabular-nums">
                    {/* Matches what the page prints for a fee with no figure,
                        so the list and the site never disagree. */}
                    {fee.price ?? (
                      <span className="text-muted-foreground">On enquiry</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {fee.content.tableOnly
                      ? "Table only"
                      : `${fee.content.included?.length ?? 0} lines`}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <FeeReorder
                      id={fee.id}
                      label={fee.title}
                      isFirst={index === 0}
                      isLast={index === fees.length - 1}
                    />
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        The headings and the notes around this schedule — including the line
        saying the figures are still to be confirmed — are edited under{" "}
        <Link
          href="/admin/website-content/fees"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Website content
        </Link>
        .
      </p>
    </div>
  );
}
