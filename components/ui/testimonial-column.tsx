"use client";

import { useAnimate } from "motion/react";
import { useEffect, useRef } from "react";

import { Stars } from "@/components/ui/stars";
import type { Testimonial } from "@/lib/content/home";

/** "T.B., London" → "T.B." — the reviewer's initials, used as the monogram. */
function monogram(name: string): string {
  return name.split(",")[0].trim();
}

/** Just enough of the playback handle for pause/resume. */
type Playback = { pause: () => void; play: () => void; stop: () => void };

/**
 * One vertically scrolling column of client reviews.
 *
 * The list is rendered twice and the track travels exactly -50%, so the second
 * copy is in the first copy's place when the loop restarts and the seam is
 * invisible. The duplicate is `aria-hidden`, so assistive technology reads each
 * review once.
 *
 * Driven through `useAnimate` rather than the declarative `animate` prop
 * because that hands back playback controls — auto-scrolling text has to be
 * stoppable to be readable, so it pauses on hover and on focus.
 *
 * The scroll runs regardless of `prefers-reduced-motion`, by request. Pausing
 * on hover and focus is what keeps the reviews readable; if the motion ever
 * needs to honour that setting again, gate this effect on `useReducedMotion`
 * and restore the matching block in `globals.css`.
 */
export function TestimonialColumn({
  testimonials,
  duration = 24,
  className = "",
}: {
  testimonials: Testimonial[];
  /** Seconds for one full pass. Vary it per column so they drift apart. */
  duration?: number;
  className?: string;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const playback = useRef<Playback | null>(null);

  useEffect(() => {
    if (!scope.current) return;

    const controls = animate(
      scope.current,
      { y: "-50%" },
      { duration, ease: "linear", repeat: Infinity, repeatType: "loop" },
    ) as unknown as Playback;

    playback.current = controls;
    return () => {
      controls.stop();
      playback.current = null;
    };
  }, [animate, duration, scope]);

  return (
    <div
      className={`voices-column ${className}`}
      onMouseEnter={() => playback.current?.pause()}
      onMouseLeave={() => playback.current?.play()}
      /* Capture, so focus landing on a card inside also pauses the column. */
      onFocusCapture={() => playback.current?.pause()}
      onBlurCapture={() => playback.current?.play()}
    >
      <div ref={scope} className="voices-track">
        {[0, 1].map((copy) =>
          testimonials.map((testimonial) => (
            <figure
              key={`${copy}-${testimonial.name}`}
              className="voice-card"
              aria-hidden={copy === 1 || undefined}
              data-clone={copy === 1 ? "true" : undefined}
            >
              <span className="voice-mark" aria-hidden="true">
                &rdquo;
              </span>
              <Stars rating={testimonial.rating} />
              <blockquote>{testimonial.quote}</blockquote>
              <figcaption>
                <span className="voice-monogram" aria-hidden="true">
                  {monogram(testimonial.name)}
                </span>
                <span>
                  <span className="voice-name">{testimonial.name}</span>
                  <span className="voice-matter">{testimonial.matter}</span>
                </span>
              </figcaption>
            </figure>
          )),
        )}
      </div>
    </div>
  );
}
