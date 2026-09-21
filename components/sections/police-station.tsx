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
              Interview under caution?
              <br />
              <em>Allow me to help.</em>
            </h2>
            <p>
              Whether you’ve been arrested or invited to attend a voluntary
              interview, it can be a harrowing experience. Some cases are made
              or broken at the interview stage. Having someone there who
              understands this well can put you at a significant advantage.
              When your police interview representative has practical
              experience in dealing with cases that go all the way to trial,
              they have the foresight to advise you comprehensively. When your
              ‘solicitor’ is unclear about how things could pan out, they could
              give you the wrong advice.
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
