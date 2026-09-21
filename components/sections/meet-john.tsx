import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";

/**
 * John's personal introduction. The home page and the about page render the
 * same copy from here, so the two stay in step by construction. The one
 * difference is `showAboutLink`: on /about the link would point at the page
 * already being read.
 */
export function MeetJohn({ showAboutLink = true }: { showAboutLink?: boolean }) {
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
              to the conclusion of your case.
            </p>
            <span className="personal-signoff">
              John Violaris<span>.</span>
            </span>
            {showAboutLink && (
              <Link className="text-link" href="/about">
                A little more about me <Icon name="arrowRight" size={17} />
              </Link>
            )}
          </div>
          <div className="personal-story">
            <p className="story-lead">
              Behind every case is a person.
              <br />
              That’s where I start.
            </p>
            <p>
              Everybody has their own story and no case is ever the same. When
              the police accuse you of wrong it’s rattling. The best lawyers
              aren’t just masters in advocacy. They’re stress relievers who are
              excellent with people from all walks of life.
            </p>
            <p>
              When you hire me you get me. No secretaries answering the phone or
              strangers turning up at Court. I will know your background and
              understand your best interests. I offer a personalised service
              where you stay in the loop.
            </p>
            <p>
              Criminal proceedings are far less stressful when the process is
              clear and you know what to expect at every given stage.
            </p>
            <div className="personal-promises">
              <div>
                <Icon name="call" size={18} />
                <h3>Direct access</h3>
                <p>I’ll be handling your case from start to finish.</p>
              </div>
              <div>
                <Icon name="bulb" size={18} />
                <h3>Clear advice</h3>
                <p>Understand your options and possible outcomes.</p>
              </div>
              <div>
                <Icon name="heart" size={18} />
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
