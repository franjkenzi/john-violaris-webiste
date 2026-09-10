import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { valueCards } from "@/lib/content/home";

/**
 * The concrete case for a one-solicitor practice. Sits after `MeetJohn`, which
 * makes the personal argument; this one makes the practical one.
 */
export function WhyInstruct() {
  return (
    <section
      className="reasons-section section-space"
      aria-labelledby="why-instruct-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> Why instruct me
            </p>
            <h2 id="why-instruct-heading" className="display-heading">
              You hire a solicitor.
              <br />
              <em>You should get one.</em>
            </h2>
          </div>
          <p className="section-intro">
            Large firms sell you a brand,
            <br />
            then hand you to whoever is free.
          </p>
        </div>

        <ul className="reasons-grid">
          {valueCards.map((card, index) => (
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
