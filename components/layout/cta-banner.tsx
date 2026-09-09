import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { siteConfig, mailtoHref } from "@/lib/site-config";

export function CtaBanner({
  heading,
  emphasis,
}: {
  heading: string;
  emphasis: string;
}) {
  return (
    <section className="closing-section" aria-labelledby="cta-heading">
      <Container>
        <div className="closing-top">
          <p className="eyebrow">
            <span className="small-rule" /> Your next step
          </p>
          <span>Free initial consultation</span>
        </div>
        <div className="closing-grid">
          <h2 id="cta-heading">
            {heading}
            <br />
            <em>{emphasis}</em>
          </h2>
          <div>
            <p>
              You don’t need all the answers.
              <br />
              Just start with what’s happened.
            </p>
            <Link href={siteConfig.bookingUrl} className="action-button">
              Book a free consultation <Icon name="arrowRight" size={18} />
            </Link>
            <a className="closing-email" href={mailtoHref}>
              {siteConfig.contact.email} <span>↗</span>
            </a>
          </div>
        </div>
        <div className="closing-bottom">
          <span>John Violaris · Criminal Defence Solicitor</span>
          <span>England & Wales</span>
        </div>
      </Container>
    </section>
  );
}
