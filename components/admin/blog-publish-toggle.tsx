"use client";

import { useOptimistic, useTransition } from "react";

import { cn } from "cn";
import { setBlogPostPublished } from "@/lib/cms/blog/actions";

/**
 * Publish or unpublish an article from the list, painted optimistically.
 *
 * Same reasoning as the enquiry status switch: the write, the revalidation and
 * the re-render take long enough to notice, and nothing about that wait tells
 * John anything. The control moves on the click and the Server Action catches
 * up behind it; React reverts if the write fails.
 *
 * A button rather than a checkbox. Publishing is an action with a consequence —
 * the article appears on a public website — not a preference being set.
 */
export function BlogPublishToggle({
  id,
  title,
  published,
}: {
  id: string;
  title: string;
  published: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(published);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      await setBlogPostPublished(id, !optimistic);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
        optimistic
          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          optimistic ? "bg-primary" : "bg-muted-foreground/50",
        )}
      />
      {optimistic ? "Published" : "Draft"}
      <span className="sr-only">
        {/* The button's job, not its state — a screen reader already has the
            state from aria-pressed. */}
        {optimistic ? ` — unpublish ${title}` : ` — publish ${title}`}
      </span>
    </button>
  );
}
