"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A table row that opens its target from anywhere in the row.
 *
 * The link inside stays a real `<a>`, and remains the only tab stop: it is what
 * carries the keyboard path, middle-click, "open in new tab" and the prefetch.
 * This adds the mouse affordance the rest of the row already implies — clicking
 * any other cell now goes where the row says it goes.
 */
export function ClickableRow({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLTableRowElement>) {
    // Anything interactive in the row handles its own click, the title link
    // included — otherwise this would navigate on top of it.
    if ((event.target as HTMLElement).closest("a, button, input, label")) {
      return;
    }

    // A click that finishes a drag across a cell is a selection, not a
    // navigation. Reading a row should not cost you your place in it.
    if (window.getSelection()?.toString()) return;

    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      window.open(href, "_blank", "noopener");

      return;
    }

    router.push(href);
  }

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer border-b last:border-b-0 hover:bg-muted/40"
    >
      {children}
    </tr>
  );
}
