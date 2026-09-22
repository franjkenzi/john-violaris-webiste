import { siteSettingsDefaults } from "@/lib/site-config";

/** John's name set in a script face, with a gold rule beneath. */
export function Signature({
  className = "",
  tone = "dark",
  name = siteSettingsDefaults.name,
  jurisdiction = siteSettingsDefaults.jurisdiction,
}: {
  className?: string;
  /** `dark` for light backgrounds, `light` for navy backgrounds. */
  tone?: "dark" | "light";
  name?: string;
  jurisdiction?: string;
}) {
  return (
    <div className={className}>
      <p
        className={`font-signature text-[42px] leading-none ${
          tone === "dark" ? "text-ink" : "text-cream"
        }`}
      >
        {name}
      </p>
      <span
        aria-hidden="true"
        className="mt-2 block h-px w-28 bg-gold"
      />
      <p
        className={`mt-2.5 text-[11px] tracking-[0.16em] uppercase ${
          tone === "dark" ? "text-muted" : "text-cream/55"
        }`}
      >
        Solicitor of {jurisdiction}
      </p>
    </div>
  );
}
