import { Container } from "@/components/ui/container";

const steps = [
  {
    title: "We talk.",
    body: "Tell me what’s happened and what’s worrying you. The first conversation is free, with no obligation.",
  },
  {
    title: "We make a plan.",
    body: "I review your situation, explain the options and agree the scope of work and fees with you.",
  },
  {
    title: "I prepare.",
    body: "I examine the evidence and prepare your case, keeping you informed and ready for the next step.",
  },
  {
    title: "I stand beside you.",
    body: "Personal representation from a solicitor who knows you and understands your case.",
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
              <em>One step at a time.</em>
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
