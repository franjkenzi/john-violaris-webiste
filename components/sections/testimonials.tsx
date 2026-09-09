import { Container } from "@/components/ui/container";
import { SectionLabel } from "@/components/ui/section-label";
import { Stars } from "@/components/ui/stars";
import { testimonials } from "@/lib/content/home";

export function Testimonials() {
  return (
    <section className="bg-sand" aria-labelledby="testimonials-heading">
      <Container className="py-16 lg:py-20">
        <div className="max-w-2xl">
          <SectionLabel>Client reviews</SectionLabel>
          <h2
            id="testimonials-heading"
            className="mt-5 font-display text-[32px] leading-[1.14] font-bold text-ink sm:text-[38px]"
          >
            What clients say
          </h2>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <li key={testimonial.name}>
              <figure className="relative flex h-full flex-col bg-white p-7 shadow-[0_2px_24px_rgba(19,30,44,0.06)]">
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-6 font-display text-[64px] leading-none text-gold/18"
                >
                  &rdquo;
                </span>
                <Stars rating={testimonial.rating} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-[1.72] text-ink">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block text-[13.5px] font-bold text-ink">
                    {testimonial.name}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {testimonial.matter}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[12px] text-muted italic">
          * Placeholder testimonials — to be replaced with verified reviews
          before launch.
        </p>
      </Container>
    </section>
  );
}
