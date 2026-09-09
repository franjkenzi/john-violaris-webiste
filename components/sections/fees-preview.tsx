import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";

const questions = [
  {
    q: "Will I deal directly with John?",
    a: "Yes. Personal representation is central to the practice. Your initial conversation is with John, and he will explain how he can help with your case.",
  },
  {
    q: "What should I have ready for the first conversation?",
    a: "Any letters, notices or court papers you have received, along with the dates of any hearing or police interview. If you don’t have everything to hand, you can still get in touch.",
  },
  {
    q: "Can John help outside London?",
    a: "John represents clients across England and Wales. Share the location of your case when you get in touch so he can discuss the arrangements with you.",
  },
  {
    q: "What if my court hearing or interview is urgent?",
    a: "Make the date and urgency clear when contacting John. For an imminent hearing or interview, please call rather than waiting for an email response.",
  },
];
export function FeesPreview() {
  return (
    <section
      className="questions-section section-space"
      aria-labelledby="questions-heading"
    >
      <Container>
        <div className="questions-grid">
          <div className="fees-note">
            <p className="eyebrow">
              <span className="small-rule" /> Let’s be clear
            </p>
            <h2 id="questions-heading" className="display-heading">
              Good advice starts
              <br />
              with <em>honesty.</em>
            </h2>
            <p>
              Your first consultation is free. Before you instruct me, we’ll
              discuss the work involved and the fees, so you can make an
              informed decision.
            </p>
            <Link href="/fees" className="text-link">
              More about fees <Icon name="arrowRight" size={17} />
            </Link>
          </div>
          <div className="questions-list">
            {questions.map((item, index) => (
              <details key={item.q} name="home-questions">
                <summary>
                  <span className="question-number">0{index + 1}</span>
                  <span>{item.q}</span>
                  <span className="question-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
