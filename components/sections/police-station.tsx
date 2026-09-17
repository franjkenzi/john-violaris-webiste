import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";

export function PoliceStation() {
  return (
    <section
      className="police-section"
      aria-labelledby="police-station-heading"
    >
      <Container>
        <div className="police-grid">
          <div className="police-copy">
            <p className="eyebrow">
              <span className="urgent-dot" /> Police station representation
            </p>
            <h2 id="police-station-heading" className="display-heading">
              The first conversation
              <br />
              <em>can matter most.</em>
            </h2>
            <p>
              Arrested or invited for a police interview? Then we may be able
              to get the police to take no further action. Get personal legal
              support from the outset… with an experienced solicitor who takes
              the time to understand your situation.
            </p>
            <Link href="/police-station" className="action-button">
              Help at the police station <Icon name="arrowRight" size={18} />
            </Link>
            <Link href="/contact#urgent" className="police-urgent">
              Interview today? Get in touch directly <span>↗</span>
            </Link>
          </div>
          <div className="police-experience">
            <span className="eyebrow">Experience you can turn to</span>
            <p className="police-number">
              10,000<span>+</span>
            </p>
            <p className="police-number-label">clients represented</p>
            <div className="police-experience-rule" />
            <p>
              Calm advice.
              <br />
              Careful preparation.
              <br />
              <em>A familiar face beside you.</em>
            </p>
            <span className="police-location">
              Representing clients across England & Wales
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
