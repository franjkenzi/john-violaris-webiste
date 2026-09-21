import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { mailtoHref, siteConfig, telHref } from "@/lib/site-config";

const interviewSupport = [
  "Receive disclosure before the interview and ask further questions about any missing detail",
  "Advise you privately and confidentially about the allegation and your options",
  "Discuss whether it’s in your best interests to give an account or to exercise your right to silence",
  "Represent you during the interview and intervene when necessary",
  "Explain the various case disposal options and advise you about what’s likely to happen next",
];

export function PoliceStationDetail() {
  return (
    <section className="police-detail section-space" aria-labelledby="police-detail-heading">
      <Container>
        <div className="police-detail-grid">
          <div className="police-detail-copy">
            <p className="eyebrow">
              <span className="small-rule" /> Before, during and after interview
            </p>
            <h2 id="police-detail-heading" className="display-heading">
              Advice at the stage
              <br />
              <em>that shapes the case.</em>
            </h2>

            <section>
              <h3>Why the police station stage matters</h3>
              <p>
                What you choose to say (or not to say) can affect the whole
                course of an investigation. Even if you’re desperate to give
                your account and dispute the allegation, sometimes it’s better
                to submit a carefully drafted prepared statement than to answer
                all questions openly. Early legal advice can influence whether
                you end up being charged in the first place.
              </p>
            </section>

            <section>
              <h3>What I can do for you at the police station</h3>
              <ul>
                {interviewSupport.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>The advantage of continuity</h3>
              <p>
                If you’re charged and given a court date, I’ll already know
                what’s been said and the extent of the evidence against you.
                There will be no need to explain everything again to somebody
                new.
              </p>
            </section>
          </div>

          <div className="police-detail-rail">
            <aside className="legal-aid-note">
              <p className="eyebrow">Police station legal advice</p>
              <h3>Usually available free of charge.</h3>
              <p>
                Legal advice at a police station is normally funded through
                legal aid and is not means tested. I will confirm the position
                for your particular circumstances before attending.
              </p>
            </aside>
            <aside className="police-urgent-card">
              <p className="eyebrow">Interview today?</p>
              <h3>Contact me as soon as you can.</h3>
              <p>
                Even if you’re clueless about the allegation, I can help you
                find out more before we attend the interview together.
              </p>
              <div>
                <a href={telHref} className="action-button">
                  <Icon name="call" size={16} />
                  {siteConfig.contact.phoneE164 ? "Call John" : "Urgent contact"}
                </a>
                <a href={mailtoHref} className="text-link">
                  Email John <Icon name="arrowRight" size={15} />
                </a>
              </div>
              <Link href="/contact#consultation" className="police-detail-prep">
                What to have ready <span aria-hidden="true">↗</span>
              </Link>
            </aside>
          </div>
        </div>
      </Container>
    </section>
  );
}
