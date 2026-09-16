"use client";

import {
  createContext,
  use,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";

import { EnquiryStatusBadge } from "@/components/admin/enquiry-status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { updateEnquiryStatus } from "@/lib/enquiries/admin-actions";
import {
  enquiryStatusLabels,
  enquiryStatuses,
  type EnquiryStatus,
} from "@/lib/enquiries/schema";

/**
 * The status switch on an enquiry, painted optimistically.
 *
 * Marking an enquiry read used to be a form post: John waited on a write, a
 * revalidation and a re-render of the page before the button moved. Nothing
 * about that wait tells him anything, so the buttons now change on the click
 * and the Server Action catches up behind them. If the write fails, React
 * reverts to the status the server last sent.
 *
 * The badge in the page header reads the same optimistic value through this
 * context, so the two never disagree mid-flight. The page in between stays a
 * Server Component — it is passed through as `children`.
 */

type EnquiryStatusState = {
  status: EnquiryStatus;
  select: (next: EnquiryStatus) => void;
};

const EnquiryStatusContext = createContext<EnquiryStatusState | null>(null);

function useEnquiryStatus() {
  const state = use(EnquiryStatusContext);

  if (!state) {
    throw new Error(
      "Enquiry status controls must be rendered inside <EnquiryStatusProvider>.",
    );
  }

  return state;
}

export function EnquiryStatusProvider({
  id,
  status,
  children,
}: {
  id: string;
  status: EnquiryStatus;
  children: ReactNode;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [, startTransition] = useTransition();

  function select(next: EnquiryStatus) {
    // Reading the optimistic value, not the prop: a second click lands on what
    // the buttons are showing rather than on a status two round trips old.
    if (next === optimisticStatus) return;

    startTransition(async () => {
      setOptimisticStatus(next);
      await updateEnquiryStatus(id, next);
    });
  }

  return (
    <EnquiryStatusContext value={{ status: optimisticStatus, select }}>
      {children}
    </EnquiryStatusContext>
  );
}

/** The header badge, following the optimistic status rather than the prop. */
export function EnquiryStatusHeaderBadge({ className }: { className?: string }) {
  const { status } = useEnquiryStatus();

  return <EnquiryStatusBadge status={status} className={className} />;
}

export function EnquiryStatusActions() {
  const { status, select } = useEnquiryStatus();

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {enquiryStatuses.map((value) => {
        const isCurrent = value === status;

        return (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={isCurrent ? "default" : "outline"}
            onClick={() => select(value)}
            aria-current={isCurrent ? "true" : undefined}
            className={cn(isCurrent && "cursor-default")}
          >
            {isCurrent ? "Marked " : "Mark as "}
            {enquiryStatusLabels[value].toLowerCase()}
          </Button>
        );
      })}
    </div>
  );
}
