import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "outline" | "outlineDark";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sharp text-center font-bold uppercase tracking-[0.07em] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy hover:bg-gold-light",
  /** For use on navy backgrounds. */
  outline:
    "border border-cream/30 text-cream hover:border-gold hover:text-gold-light",
  /** For use on light backgrounds. */
  outlineDark:
    "border border-navy/25 text-navy hover:border-gold hover:text-gold-ink",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-xs",
  lg: "px-7 py-3.5 text-[13px]",
};

type ButtonLinkProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "children">;

/** Primary call-to-action. Renders a Next `Link`, so it works for `/routes`,
 *  `tel:`, `mailto:` and external booking URLs alike. */
export function ButtonLink({
  variant = "gold",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
