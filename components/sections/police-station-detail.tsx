import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { mailtoHref, siteConfig, telHref } from "@/lib/site-config";

const interviewSupport = [
  "Speak to the investigating officer and obtain available disclosure before interview",
  "Advise you privately about the allegation, your rights and your options",
  "Discuss whether to answer questions, provide a prepared statement or exercise your right to silence",
  "Attend the interview and intervene where questions or procedure require it",
  "Explain bail, release under investigation and what is likely to happen next",
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
                What you say—and what you choose not to say—can affect the
                whole course of an investigation. Early advice means you can
                make that decision after understanding the allegation and the
                information the police have disclosed.
              </p>
            </section>

            <section>
              <h3>What John does at the police station</h3>
              <ul>
                {interviewSupport.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>The advantage of continuity</h3>
              <p>
                If the matter proceeds to court, John already knows your
                account, the interview and the investigation from the start.
                You do not need to explain everything again to a new
                representative at each stage.
              </p>
            </section>
          </div>

          <div className="police-detail-rail">
            <aside className="legal-aid-note">
              <p className="eyebrow">Police station legal advice</p>
              <h3>Usually available free of charge.</h3>
              <p>
                Legal advice at a police station is normally funded through
                legal aid and is not generally means tested. John will confirm
                the position for your circumstances before attending.
              </p>
            </aside>
            <aside className="police-urgent-card">
              <p className="eyebrow">Interview today?</p>
              <h3>Contact John as soon as you can.</h3>
              <p>
                Share the station, interview time and anything you have been
                told about the allegation.
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
