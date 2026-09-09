/** Star rating for testimonials. Accessible name is supplied via `aria-label`. */
export function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <p
      className="flex gap-0.5 text-gold"
      aria-label={`Rated ${filled} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={13}
          height={13}
          fill={i < filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z" />
        </svg>
      ))}
    </p>
  );
}
