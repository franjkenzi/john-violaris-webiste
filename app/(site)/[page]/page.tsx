import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/layout/cta-banner";
import { PageIntro } from "@/components/pages/page-intro";
import { AboutBackground } from "@/components/sections/about-background";
import { CareerBand } from "@/components/sections/career-band";
import { ContactEnquiryForm } from "@/components/sections/contact-enquiry-form";
import { FeesMatrix } from "@/components/sections/fees-matrix";
import { FeesSchedule } from "@/components/sections/fees-schedule";
import { FeesPreview } from "@/components/sections/fees-preview";
import { MeetJohn } from "@/components/sections/meet-john";
import { PoliceStation } from "@/components/sections/police-station";
import { PoliceStationDetail } from "@/components/sections/police-station-detail";
import { ProcessSteps } from "@/components/sections/process-steps";
import { ServicesGrid } from "@/components/sections/services-grid";
import { Container } from "@/components/ui/container";
import { ReviewSolicitorsWidget } from "@/components/ui/review-solicitors";
import { Icon } from "@/components/ui/icons";
import {
  mailtoHref,
  siteConfig,
  telHref,
  whatsappHref,
} from "@/lib/site-config";

const pages: Record<
  string,
  { eyebrow: string; title: string; emphasis: string; description: string }
> = {
  about: {
    eyebrow: "About John",
    title: "Serious experience.",
    emphasis: "A personal approach.",
    description:
      "“Work doesn’t feel like work when you’re doing what you love.” — John Violaris",
  },
  services: {
    eyebrow: "Areas of practice",
    title: "Your situation.",
    emphasis: "A considered response.",
    description:
      "Motoring offences, police interviews and criminal defence. Find the support that fits what you’re facing.",
  },
  "police-station": {
    eyebrow: "Police station representation",
    title: "At the very beginning.",
    emphasis: "By your side.",
    description:
      "Personal representation when you have been arrested or asked to attend a police interview.",
  },
  fees: {
    eyebrow: "Fees & consultation",
    title: "Clarity from",
    emphasis: "the first conversation.",
    description:
      "Understand the work involved and discuss the fees before deciding whether to instruct John.",
  },
  reviews: {
    eyebrow: "Client reviews",
    title: "Verified reviews.",
    emphasis: "Independently collected.",
    description:
      "Reviews left by John’s clients on ReviewSolicitors, the independent review site for the legal profession. Collected and published by them, not by this website.",
  },
  contact: {
    eyebrow: "Speak to John",
    title: "Tell me what’s happened.",
    emphasis: "We’ll start there.",
    description:
      "A free initial conversation, directly with John. Share your situation, your concerns and any important dates.",
  },
  /*
   * `blog` is deliberately absent: it has its own route at `app/blog/page.tsx`
   * so that the index and the article pages under `/blog/[slug]` sit in one
   * tree. Adding it back here would create two candidates for `/blog`.
   */
};
export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const content = pages[page];
  if (!content) return {};
  return {
    title: content.eyebrow,
    description: content.description,
    alternates: { canonical: `/${page}` },
  };
}
export default async function InformationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const content = pages[page];
  if (!content) notFound();

  // Null until a usable number is configured; the row is omitted rather than
  // linking the visitor back to the page they are already reading.
  const whatsapp = whatsappHref();
  return (
    <>
      <PageIntro {...content} />
      {page === "about" && (
        <>
          <MeetJohn />
          <AboutBackground />
          <CareerBand />
          <ProcessSteps />
        </>
      )}
      {page === "services" && <ServicesGrid />}
      {page === "reviews" && (
        <section className="section-space reviews-page">
          <Container>
            {/*
              `afterInteractive`, not the component default: on this page the
              reviews are what the visitor came for, so the widget should not
              wait for browser idle time.
            */}
            <ReviewSolicitorsWidget
              widget="full-page"
              elementId="rswidget_8448b"
              strategy="afterInteractive"
            />
          </Container>
        </section>
      )}
      {page === "police-station" && (
        <>
          <PoliceStation />
          <PoliceStationDetail />
          <section className="section-space">
            <Container>
              <div className="information-grid">
                {[
                  {
                    title: "Before the interview",
                    body: "Let John know the station, the interview time and anything you have been told about the allegation. Share any paperwork you have received.",
                  },
                  {
                    title: "Personal support",
                    body: "John will discuss your circumstances, help you understand the situation and explain how he can assist with your interview.",
                  },
                  {
                    title: "After the interview",
                    body: "Understand what you have been told about the next steps and discuss any further representation you may need.",
                  },
                ].map((item) => (
                  <article key={item.title}>
                    <h2>{item.title}</h2>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}
      {page === "fees" && (
        <>
          <section className="section-space">
            <Container>
              <div className="information-grid">
                <article>
                  <span className="eyebrow">01 / Initial consultation</span>
                  <h2>A conversation. Free.</h2>
                  <p>
                    Talk through what has happened and find out how John can
                    help. There is no obligation to instruct him.
                  </p>
                </article>
                <article>
                  <span className="eyebrow">02 / Your case</span>
                  <h2>A clear scope of work.</h2>
                  <p>
                    The work required depends on the allegation, the evidence
                    and the stage of the case. John will discuss your individual
                    requirements.
                  </p>
                </article>
                <article>
                  <span className="eyebrow">03 / Before you instruct</span>
                  <h2>Fees discussed with you.</h2>
                  <p>
                    Ask what is included and whether further work or hearings
                    could affect the cost. You can make your decision with that
                    information to hand.
                  </p>
                </article>
              </div>
            </Container>
          </section>
          <FeesMatrix />
          <FeesSchedule />
          <FeesPreview />
        </>
      )}
      {page === "contact" && (
        <>
          <ContactEnquiryForm />
          <section className="section-space" id="consultation">
            <Container>
              <div className="contact-grid">
                <div>
                  <p className="eyebrow">Start a conversation</p>
                  <h2 className="display-heading">
                    A direct line.
                    <br />
                    <em>A personal response.</em>
                  </h2>
                  <div className="contact-methods">
                    <a href={mailtoHref}>
                      <span>Email John</span>
                      <strong>{siteConfig.contact.email}</strong>
                      <Icon name="arrowRight" size={20} />
                    </a>
                    <a href={telHref}>
                      <span>Call John</span>
                      <strong>{siteConfig.contact.phoneDisplay}</strong>
                      <Icon name="call" size={20} />
                    </a>
                    {whatsapp ? (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Prefer a message?</span>
                        <strong>WhatsApp John</strong>
                        <Icon name="whatsapp" size={20} />
                      </a>
                    ) : null}
                  </div>
                  <p className="contact-disclaimer">
                    Getting in touch does not create a solicitor–client
                    relationship, and no relationship exists until John has
                    confirmed he is able to act and the terms of business are
                    agreed. Please do not send confidential details of your
                    case until then.
                  </p>
                </div>
                <aside className="contact-note">
                  <p className="eyebrow">Your first conversation</p>
                  <h2>
                    We’ll take it
                    <br />
                    <em>one step at a time.</em>
                  </h2>
                  <p>It helps to have:</p>
                  <ul>
                    <li>A brief outline of what happened</li>
                    <li>Any letters or court papers</li>
                    <li>Your hearing or interview date</li>
                    <li>The location of your case</li>
                  </ul>
                  <p>
                    You can still get in touch if you don’t have everything
                    yet.
                  </p>
                  <a href={mailtoHref} className="action-button">
                    Arrange a free consultation{" "}
                    <Icon name="arrowRight" size={17} />
                  </a>
                  <div className="contact-urgent" id="urgent">
                    <strong>Court tomorrow? Interview today?</strong>
                    <p>
                      Please call rather than email. Make the date and urgency
                      clear when you get in touch.
                    </p>
                  </div>
                  <p className="contact-preview-note">
                    Preview: John’s phone, WhatsApp, booking URL, SRA number,
                    practice arrangement and complaints information must be
                    confirmed before launch. The email address should also be
                    checked.
                  </p>
                </aside>
              </div>
            </Container>
          </section>
        </>
      )}
      {page !== "contact" && (
        <CtaBanner heading="Let’s take the" emphasis="next step. Together." />
      )}
    </>
  );
}
