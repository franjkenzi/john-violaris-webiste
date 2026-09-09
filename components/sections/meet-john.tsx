import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";

export function MeetJohn() {
  return (
    <section
      id="john"
      className="personal-section section-space"
      aria-labelledby="meet-john-heading"
    >
      <Container>
        <div className="personal-grid">
          <div className="personal-heading">
            <p className="eyebrow">
              <span className="small-rule" /> The person in your corner
            </p>
            <h2 id="meet-john-heading" className="display-heading">
              I’m John.
              <br />
              <em>Your solicitor.</em>
            </h2>
            <p className="personal-aside">
              From our first conversation
              <br />
              to the next step in your case.
            </p>
            <span className="personal-signoff">
              John Violaris<span>.</span>
            </span>
            <Link className="text-link" href="/about">
              A little more about me <Icon name="arrowRight" size={17} />
            </Link>
          </div>
          <div className="personal-story">
            <p className="story-lead">
              Behind every case is a person.
              <br />
              That’s where I start.
            </p>
            <p>
              A letter arrives. A court date is set. The police ask to speak to
              you. Suddenly, a situation you never expected is taking over your
              life.
            </p>
            <p>
              I qualified in 2005 and have spent more than twenty years in
              criminal defence. My job is to help you understand where you
              stand, prepare your case carefully, and represent you personally.
            </p>
            <p>
              You’ll speak directly with me. I’ll listen, explain your options
              in plain English, and be honest about what happens next.
            </p>
            <div className="personal-promises">
              <div>
                <span>01</span>
                <h3>Direct access</h3>
                <p>Speak to the solicitor handling your case.</p>
              </div>
              <div>
                <span>02</span>
                <h3>Clear advice</h3>
                <p>Understand your options and your next step.</p>
              </div>
              <div>
                <span>03</span>
                <h3>Personal attention</h3>
                <p>Your circumstances shape the approach.</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
