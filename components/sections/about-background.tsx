import { Container } from "@/components/ui/container";

const background = [
  {
    title: "Education",
    paragraphs: [
      "John graduated from the University of Bristol in 2001 with a 2:1 degree in LLB Law (European Legal Studies), before completing the Legal Practice Course at UWE Bristol in 2002.",
      "He went on to complete his training contract at Galbraith Branley Solicitors in North London between 2003 to 2005, where he began representing clients at police stations.",
    ],
  },
  {
    title: "Practice",
    paragraphs: [
      "John qualified in 2005 and has specialised in criminal defence at the police station and magistrates’ court ever since.",
      "John currently practices at Darryl Ingram Solicitors and is a Duty Solicitor serving local courts and police stations in the Greater London area. His experience spans all crime representing people from all backgrounds. His current practice is focused on motoring defences and trial representation.",
    ],
  },
  {
    title: "What drives him",
    paragraphs: [
      "Throughout more than 20 years in legal-aid practice, John worked on a simple principle: the value of a case should never be measured by the fee attached to it. What mattered was the person relying on him and the outcome they faced. That same commitment continues today — every client matters, every case deserves careful preparation, and every result is worth fighting for.",
    ],
  },
  {
    title: "His approach",
    paragraphs: [
      "Thorough preparation. Clear advice. Personal representation.",
      "John handles your case from beginning to end, explaining what to expect, preparing every detail and advocating for you personally in court. The solicitor you instruct is the solicitor who knows your case — and the one standing beside you when it matters most.",
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
