import { Container } from "@/components/ui/container";
import { careerBandDefaults } from "@/lib/content/pages";
import type { CareerBandContent } from "@/lib/content/pages";

/** Slim dark band tracing John's route to practice. Used on the about page. */
export function CareerBand({
  content = careerBandDefaults,
}: {
  content?: CareerBandContent;
}) {
  return (
    <section className="career-band" aria-labelledby="career-heading">
      <Container>
        <p className="eyebrow" id="career-heading">
          <span className="small-rule" /> {content.eyebrow}
        </p>
        <ol className="career-grid">
          {content.milestones.map((milestone) => (
            <li key={milestone.year}>
              <span className="career-year">{milestone.year}</span>
              <span className="career-title">{milestone.title}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
