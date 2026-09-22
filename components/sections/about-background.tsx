import { Container } from "@/components/ui/container";
import { Lines } from "@/components/ui/lines";
import { aboutBackgroundDefaults } from "@/lib/content/pages";
import type { AboutBackgroundContent } from "@/lib/content/pages";

export function AboutBackground({
  content = aboutBackgroundDefaults,
}: {
  content?: AboutBackgroundContent;
}) {
  return (
    <section className="about-background section-space" aria-labelledby="background-heading">
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> {content.eyebrow}
            </p>
            <h2 id="background-heading" className="display-heading">
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
        <div className="about-background-grid">
          {content.entries.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              {item.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
