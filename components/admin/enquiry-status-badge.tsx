import { cn } from "cn";

import { enquiryStatusLabels, type EnquiryStatus } from "@/lib/enquiries/schema";

/** Dot colour carries the state at a glance; the label carries it accessibly. */
const dotClasses: Record<EnquiryStatus, string> = {
  new: "bg-amber-500",
  read: "bg-sky-500",
  replied: "bg-emerald-500",
  archived: "bg-muted-foreground/40",
};

export function EnquiryStatusBadge({
  status,
  className,
}: {
  status: EnquiryStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        status === "new" && "border-amber-500/40 bg-amber-500/10",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", dotClasses[status])}
        aria-hidden="true"
      />
      {enquiryStatusLabels[status]}
    </span>
  );
}
