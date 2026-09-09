import { Container } from "@/components/ui/container";
import { milestones } from "@/lib/content/home";

/** Slim dark band tracing John's route to practice. */
export function CareerBand() {
  return (
    <section className="bg-navy-mid" aria-labelledby="career-heading">
      <Container className="py-10 lg:py-12">
        <h2
          id="career-heading"
          className="text-[10px] font-bold tracking-[0.24em] text-gold/80 uppercase"
        >
          Twenty years to this point
        </h2>

        <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {milestones.map((milestone) => (
            <li
              key={milestone.year}
              className="border-t border-gold/20 pt-4 lg:pr-4"
            >
              <p className="font-display text-[21px] leading-none font-bold text-gold">
                {milestone.year}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-cream/55">
                {milestone.title}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
