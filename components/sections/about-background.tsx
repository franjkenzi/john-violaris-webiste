import { Container } from "@/components/ui/container";

const background = [
  {
    title: "Education",
    paragraphs: [
      "John graduated from the University of Bristol in 2001 with an LLB Honours degree in Law with European Legal Studies, before completing the Legal Practice Course at UWE Bristol in 2002.",
      "He served his training contract at Galbraith Branley Solicitors from 2003 to 2005, where he began representing clients at police stations.",
    ],
  },
  {
    title: "Practice",
    paragraphs: [
      "John qualified in 2005 and has specialised in criminal defence at the police station and in the magistrates’ court ever since.",
      "His experience spans criminal offences, youth court representation and road traffic law, with his current practice focused on motoring defence and personal representation.",
    ],
  },
  {
    title: "What drives him",
    paragraphs: [
      "For more than two decades John represented clients through legal-aid practice, without allowing the fee structure to determine the quality of service they received.",
      "That same belief still shapes the practice: the result for the client matters, and every case deserves careful preparation.",
    ],
  },
  {
    title: "His approach",
    paragraphs: [
      "John gives honest advice at every stage. He explains what to expect, prepares the case thoroughly and advocates personally in court.",
      "The solicitor you first speak to is the solicitor who learns your case and stands beside you at the hearing.",
    ],
  },
];

export function AboutBackground() {
  return (
    <section className="about-background section-space" aria-labelledby="background-heading">
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> Background and approach
            </p>
            <h2 id="background-heading" className="display-heading">
              Experience built
              <br />
              <em>case by case.</em>
            </h2>
          </div>
          <p className="section-intro">
            Education, practice and the principles behind John’s work.
          </p>
        </div>
        <div className="about-background-grid">
          {background.map((item, index) => (
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
