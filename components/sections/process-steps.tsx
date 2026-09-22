import { Container } from "@/components/ui/container";
import { Lines } from "@/components/ui/lines";
import { processDefaults } from "@/lib/content/pages";
import type { ProcessContent } from "@/lib/content/pages";

export function ProcessSteps({
  content = processDefaults,
}: {
  content?: ProcessContent;
}) {
  return (
    <section
      className="process-section section-space"
      aria-labelledby="process-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> {content.eyebrow}
            </p>
            <h2 id="process-heading" className="display-heading">
              <Lines values={content.headline} />
              <br />
              <em>
                <Lines values={content.headlineEmphasis} />
              </em>
            </h2>
          </div>
          {content.intro.length > 0 ? (
            <p className="section-intro">
              <Lines values={content.intro} />
            </p>
          ) : null}
        </div>
        <ol className="process-grid">
          {content.steps.map((step, i) => (
            <li key={step.title}>
              <div className="process-number">
                <span>0{i + 1}</span>
                <span aria-hidden="true">↗</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
