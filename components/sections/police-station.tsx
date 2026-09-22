import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { Lines, Paragraphs } from "@/components/ui/lines";
import { policeStationDefaults } from "@/lib/content/pages";
import type { PoliceStationContent } from "@/lib/content/pages";

export function PoliceStation({
  content = policeStationDefaults,
}: {
  content?: PoliceStationContent;
}) {
  return (
    <section
      className="police-section"
      aria-labelledby="police-station-heading"
    >
      <Container>
        <div className="police-grid">
          <div className="police-copy">
            <p className="eyebrow">
              <span className="urgent-dot" /> {content.eyebrow}
            </p>
            <h2 id="police-station-heading" className="display-heading">
              <Lines values={content.headline} />
              <br />
              <em>
                <Lines values={content.headlineEmphasis} />
              </em>
            </h2>
            <Paragraphs values={content.body} />
            <Link href="/police-station" className="action-button">
              {content.ctaLabel} <Icon name="arrowRight" size={18} />
            </Link>
            <Link href="/contact#urgent" className="police-urgent">
              {content.urgentLabel} <span>↗</span>
            </Link>
          </div>
          <div className="police-experience">
            <span className="eyebrow">{content.railEyebrow}</span>
            <p className="police-number">
              {content.railValue}
              {content.railSuffix ? <span>{content.railSuffix}</span> : null}
            </p>
            <p className="police-number-label">{content.railLabel}</p>
            <div className="police-experience-rule" />
            <p>
              <Lines values={content.railLines} />
              <br />
              <em>{content.railLinesEmphasis}</em>
            </p>
            <span className="police-location">{content.railLocation}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
