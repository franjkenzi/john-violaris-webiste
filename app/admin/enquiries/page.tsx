import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Inbox } from "lucide-react";

import { EnquiryStatusBadge } from "@/components/admin/enquiry-status-badge";
import { cn } from "cn";
import {
  countEnquiries,
  listEnquiries,
  type EnquiryFilter,
} from "@/lib/enquiries/queries";
import {
  enquiryFullName,
  enquiryStatusLabels,
  enquiryStatuses,
  isEnquiryStatus,
} from "@/lib/enquiries/schema";
import { formatUkShortDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Enquiries",
};

const filters: { value: EnquiryFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...enquiryStatuses.map((status) => ({
    value: status,
    label: enquiryStatusLabels[status],
  })),
];

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: EnquiryFilter = isEnquiryStatus(status) ? status : "all";

  const [enquiries, counts] = await Promise.all([
    listEnquiries(filter),
    countEnquiries(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every enquiry sent through the contact form, newest first. Replying by
          email or telephone happens outside the dashboard — mark the status here
          so you can see what is still outstanding.
        </p>
      </header>

      <nav
        className="mb-5 flex flex-wrap gap-1.5"
        aria-label="Filter enquiries by status"
      >
        {filters.map((item) => {
          const isActive = item.value === filter;

          return (
            <Link
              key={item.value}
              href={
                item.value === "all"
                  ? "/admin/enquiries"
                  : `/admin/enquiries?status=${item.value}`
              }
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive ? "opacity-70" : "text-muted-foreground",
                )}
              >
                {counts[item.value]}
              </span>
            </Link>
          );
        })}
      </nav>

      {enquiries.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <Inbox className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">
            {filter === "all"
              ? "No enquiries yet."
              : `No ${enquiryStatusLabels[filter].toLowerCase()} enquiries.`}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {filter === "all"
              ? "Submissions from the contact form will appear here as soon as they arrive."
              : "Try another status filter to see the rest of the inbox."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">
              Enquiries, most recently received first
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
                  Matter
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Court date
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Received
                </th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  className="border-b last:border-b-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 align-top">
                    <EnquiryStatusBadge status={enquiry.status} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    {/* The whole row is reachable from this one link, which
                        keeps a single tab stop per enquiry. */}
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                    >
                      {enquiryFullName(enquiry)}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {enquiry.email}
                    </span>
                    {enquiry.email_error ? (
                      <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-destructive">
                        <AlertTriangle className="size-3.5" aria-hidden="true" />
                        Email not delivered
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">{enquiry.matter_type}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {enquiry.court_date || "—"}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
                    <time dateTime={enquiry.created_at}>
                      {formatUkShortDateTime(enquiry.created_at)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
