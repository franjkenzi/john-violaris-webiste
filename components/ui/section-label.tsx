import type { ReactNode } from "react";

/** Uppercase eyebrow above a section heading, with the gold rule from the demo. */
export function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`section-label ${className}`}>{children}</p>;
}
