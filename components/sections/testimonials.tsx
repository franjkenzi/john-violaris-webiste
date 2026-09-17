import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { TestimonialColumn } from "@/components/ui/testimonial-column";
import { testimonials } from "@/lib/content/home";

/** Deal round-robin so neighbouring columns never show the same review. */
const columns = [0, 1, 2].map((column) =>
  testimonials.filter((_, index) => index % 3 === column),
);

/** Seconds per pass. Deliberately uneven so the columns drift out of step. */
const durations = [26, 34, 30];

/**
 * Client voices, on navy so the section reads as a pause between the two light
 * bands either side of it.
 *
 * The columns are a marquee at tablet width and up. Below that a single column
 * carries every review instead — splitting three reviews across three columns
 * would leave a phone showing only the first of them.
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
