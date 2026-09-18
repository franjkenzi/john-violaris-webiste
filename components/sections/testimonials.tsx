import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { TestimonialColumn } from "@/components/ui/testimonial-column";
import { testimonials } from "@/lib/content/home";

const COLUMNS = 3;

/**
 * Deal round-robin so neighbouring columns never show the same review.
 *
 * Below three reviews there is nothing to deal — a third of two leaves the last
 * column empty — so each column takes the whole list instead, rotated by its
 * own index. A review is then on screen more than once, which two reviews and
 * three columns make unavoidable; what the rotation and the staggered starts
 * buy is that the repeats are never level with each other. The section goes
 * back to dealing on its own as soon as a third review is added.
 */
const columns = Array.from({ length: COLUMNS }, (_, column) =>
  testimonials.length >= COLUMNS
    ? testimonials.filter((_, index) => index % COLUMNS === column)
    : testimonials.map(
        (_, index) => testimonials[(index + column) % testimonials.length],
      ),
);

/** Seconds per pass. Deliberately uneven so the columns drift out of step. */
const durations = [26, 34, 30];

/** Where each column starts in its pass, as a fraction. Uneven, for the same reason. */
const starts = [0, 0.38, 0.71];

/**
 * Client voices, on navy so the section reads as a pause between the two light
 * bands either side of it.
 *
 * The columns are a marquee at tablet width and up. Below that a single column
 * carries every review instead — splitting three reviews across three columns
 * would leave a phone showing only the first of them.
 *
 * Every review here is a verified one from John's ReviewSolicitors profile, and
 * the button underneath leads to the same reviews in full. There are two of
 * them today, so they come round repeatedly; the alternative was writing copy
 * to fill the gap, which is the one thing this section must not do.
 */
export function Testimonials() {
  return (
    <section
      className="voices-section section-space"
      aria-labelledby="testimonials-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> In their words
            </p>
            <h2 id="testimonials-heading" className="display-heading">
              People who were
              <br />
              <em>where you are now.</em>
            </h2>
          </div>
          <p className="section-intro">
            Every case is different.
            <br />
            What stays the same is who handles it.
          </p>
        </div>

        <div className="voices-marquee">
          <TestimonialColumn
            testimonials={testimonials}
            duration={30}
            className="voices-column-stacked"
          />
          {columns.map((column, index) => (
            <TestimonialColumn
              key={index}
              testimonials={column}
              duration={durations[index]}
              start={starts[index]}
              className={`voices-column-split voices-column-${index + 1}`}
            />
          ))}
        </div>

        <div className="voices-action">
          <Link href="/reviews" className="action-button">
            View all verified reviews <Icon name="arrowRight" size={17} />
          </Link>
          <p className="voices-note">
            Independently collected and published by ReviewSolicitors.
          </p>
        </div>
      </Container>
    </section>
  );
}
