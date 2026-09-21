import { Container } from "@/components/ui/container";

const steps = [
  {
    title: "We talk.",
    body: "Start by telling me what’s happened and what’s worrying you. The first conversation is free, confidential and comes with no obligation.",
  },
  {
    title: "We make a plan.",
    body: "I’ll explain where you stand, talk you through your options and agree a clear strategy with you.",
  },
  {
    title: "I prepare.",
    body: "I examine the evidence, identify the issues and prepare your case thoroughly, keeping you informed and ready at every stage.",
  },
  {
    title: "I stand beside you.",
    body: "The solicitor who advises you is the solicitor who prepares your case and represents you in court. One point of contact. Personal representation from start to finish.",
  },
];
export function ProcessSteps() {
  return (
    <section
      className="process-section section-space"
      aria-labelledby="process-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> What happens next
            </p>
            <h2 id="process-heading" className="display-heading">
              Less uncertainty.
              <br />
              <em>Less stress</em>
            </h2>
          </div>
          <p className="section-intro">
            You don’t have to work it all out today.
            <br />
            It starts with a conversation.
          </p>
        </div>
        <ol className="process-grid">
          {steps.map((step, i) => (
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
