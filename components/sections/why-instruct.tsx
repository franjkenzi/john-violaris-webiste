import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { Lines } from "@/components/ui/lines";
import { whyInstructDefaults } from "@/lib/content/pages";
import type { WhyInstructContent } from "@/lib/content/pages";

/**
 * The concrete case for a one-solicitor practice. Sits after `MeetJohn`, which
 * makes the personal argument; this one makes the practical one.
 */
export function WhyInstruct({
  content = whyInstructDefaults,
}: {
  content?: WhyInstructContent;
}) {
  return (
    <section
      className="reasons-section section-space"
      aria-labelledby="why-instruct-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> {content.eyebrow}
            </p>
            <h2 id="why-instruct-heading" className="display-heading">
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

        <ul className="reasons-grid">
          {content.cards.map((card, index) => (
            <li key={card.title} className="reveal">
              <div className="reason-top">
                <Icon name={card.icon} size={24} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
