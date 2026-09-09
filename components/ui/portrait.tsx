import type { ReactNode } from "react";

/**
 * Portrait frame — an offset gold rule sitting behind a photograph, with an
 * optional credential card overlapping the lower corner.
 *
 * Until John's professional photographs are supplied this renders a deliberate
 * placeholder. Swap the inner block for `next/image` when the files arrive.
 */
export function Portrait({
  badge,
  className = "",
  ratio = "aspect-4/5",
}: {
  badge?: ReactNode;
  className?: string;
  ratio?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Offset frame */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] border border-gold/35"
      />

      <div
        className={`relative ${ratio} w-full overflow-hidden rounded-[2px] border border-gold/20 bg-navy-mid`}
      >
        {/* Placeholder field */}
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_10%,rgba(201,168,76,0.10),transparent_65%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <svg
            viewBox="0 0 24 24"
            width={54}
            height={54}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-gold/25"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
          <span className="text-[10px] tracking-[0.2em] text-cream/50 uppercase">
            Photograph of John
          </span>
        </div>
      </div>

      {badge}
    </div>
  );
}

/** Credential card that overlaps the portrait's lower-left corner. */
export function PortraitBadge({
  headline,
  detail,
}: {
  headline: string;
  detail: string;
}) {
  return (
    <div className="absolute bottom-8 -left-6 max-w-[15rem] border border-gold/30 bg-navy-deep/95 px-5 py-3.5 shadow-2xl shadow-black/50 backdrop-blur-[2px] sm:-left-10">
      <p className="font-display text-[15px] leading-tight font-bold text-gold">
        {headline}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-cream/58">{detail}</p>
    </div>
  );
}
