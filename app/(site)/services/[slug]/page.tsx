import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/pages/page-intro";
import { Container } from "@/components/ui/container";
import { OnThisPage } from "@/components/ui/on-this-page";
import { Icon } from "@/components/ui/icons";
import { CtaBanner } from "@/components/layout/cta-banner";
import { allServices, serviceGroups } from "@/lib/content/services";
import { serviceDescriptions } from "@/lib/content/service-descriptions";
import { serviceDetails } from "@/lib/content/service-detail";
import { siteConfig, whatsappHref } from "@/lib/site-config";

function findService(slug: string) {
  return allServices.find((service) => service.href === `/services/${slug}`);
}
export function generateStaticParams() {
  return allServices
    .filter((service) => service.href.startsWith("/services/"))
    .map((service) => ({ slug: service.href.split("/").pop()! }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) return {};
  const detail = serviceDetails[service.href];
  return {
    title: `${service.name} Solicitor`,
    description: detail?.intro ?? serviceDescriptions[service.href]?.intro,
    alternates: { canonical: service.href },
  };
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();

  // The offence is prefilled into the chat, so a message arriving from this
  // page already says what it is about. Null when no number is configured.
  const whatsapp = whatsappHref(service.name);

  const detail = serviceDetails[service.href];
  const group = serviceGroups.find((candidate) =>
    candidate.services.some((item) => item.href === service.href),
  );
  /*
   * `Non-Motoring Crime` is kept out of the related list: it covers the same
   * ground as `All Crime` above it, so offering both reads as a duplicate.
   * The service itself still has its page and its place in the nav.
   */
  const related =
    group?.services.filter(
      (item) =>
        item.href !== service.href && item.href !== "/services/all-crime",
    ) ?? [];
  /*
   * Every group but this one is a motoring offence, so the checklist below can
   * ask for a driving record. On a representation page it cannot: the client
   * may never have been accused of a motoring offence at all.
   */
  const isMotoringOffence = group?.heading !== "Representation";
  /* Mirrors the headings rendered below, in document order. */
  const sections = [
    ...(detail ? [{ id: "at-a-glance", label: "At a glance" }] : []),
    ...(detail ? [{ id: "legal-framework", label: "Legal framework" }] : []),
    { id: "your-options", label: "Clarity first" },
    ...(detail
      ? [{ id: "sentencing-and-outcomes", label: "Sentencing and outcomes" }]
      : []),
    ...(detail?.ancillaryOrders
      ? [{ id: "ancillary-orders", label: "Ancillary orders" }]
      : []),
    { id: "what-to-share", label: "What to share with me" },
    { id: "personal-representation", label: "Personal representation" },
  ];
  return (
    <>
      <PageIntro
        /* The breadcrumb reads from `eyebrow`, so the offence name belongs here. */
        eyebrow={service.name}
        title={detail?.headline ?? service.name.replace(" · ", " / ")}
        emphasis={detail?.emphasis ?? "Let’s understand your options."}
        description={
          detail?.intro ??
          serviceDescriptions[service.href]?.intro ??
          "Personal advice and representation from John Violaris, across England and Wales."
        }
      />
      {detail && (
        <section className="penalty-strip" aria-labelledby="at-a-glance">
          <Container>
            <div className="penalty-strip-head">
              <p className="eyebrow" id="at-a-glance">
                <span className="small-rule" /> At a glance
              </p>
              {service.statute && (
                <span className="penalty-statute">{service.statute}</span>
              )}
            </div>
            <div className="penalty-cards">
              {detail.penalties.map((penalty) => (
                <div
                  key={penalty.label}
                  className={`penalty-card penalty-card--${penalty.tone}`}
                >
                  <strong>{penalty.label}</strong>
                  <span>{penalty.note}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
      <section className="section-space">
        <Container>
          <div className="service-detail-grid">
            <div className="service-detail-copy">
              {detail ? (
                <>
                  <h2 id="legal-framework" className="service-section-heading">
                    The legal framework
                  </h2>
                  <p>
                    {/*
                     * The sentence only holds where `statute` is a citation.
                     * On a representation page it is a plain descriptor
                     * ("Where most cases are heard"), so it is left out
                     * rather than read back as a legal reference.
                     */}
                    {isMotoringOffence && service.statute && (
                      <>
                        The headline reference for this service is{" "}
                        {service.statute}.{" "}
                      </>
                    )}
                    After reviewing the facts and the procedural history of your
                    case, I will identify the legislation and caselaw that apply
                    to your case.
                  </p>
                  <p className="eyebrow">
                    <span className="small-rule" /> {detail.issuesHeading}
                  </p>
                  <h2 id="your-options" className="display-heading">
                    Clarity first.
                    <br />
                    <em>Then light at the end of the tunnel</em>
                  </h2>
                  <p>{detail.issuesIntro}</p>
                  <dl className="issue-list">
                    {detail.defenceIssues.map((issue) => (
                      <div key={issue.title}>
                        <dt>{issue.title}</dt>
                        <dd>{issue.body}</dd>
                      </div>
                    ))}
                  </dl>
                  <h3 id="sentencing-and-outcomes">
                    Sentencing and possible outcomes
                  </h3>
                  <p>
                    The court has the power to dispose of cases in multiple
                    ways. The following are a breakdown of most disposal options
                    and what they mean.
                  </p>
                  <div className="service-outcomes-table-wrap">
                    <table className="service-outcomes-table">
                      <caption>
                        {detail.outcomes
                          ? "Disposal options at the Magistrates Court"
                          : `Headline consequences for ${service.name}`}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Potential outcome</th>
                          <th scope="col">What this means</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.outcomes ?? detail.penalties).map((row) => (
                          <tr key={row.label}>
                            <th scope="row">{row.label}</th>
                            <td>{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {detail.ancillaryOrders && (
                    <>
                      <h3 id="ancillary-orders">Ancillary orders</h3>
                      <p>
                        The Court can impose additional orders against you that
                        compel you to behave in a certain way or to prevent you
                        from doing something.
                      </p>
                      <div className="service-outcomes-table-wrap">
                        <table className="service-outcomes-table">
                          <caption>
                            Ancillary orders the court can impose
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">Ancillary order</th>
                              <th scope="col">What this means</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.ancillaryOrders.map((row) => (
                              <tr key={row.label}>
                                <th scope="row">{row.label}</th>
                                <td>{row.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  <h3 id="what-to-share">What to share with me</h3>
                  <ul>
                    <li>
                      Any notice, letter or charge paperwork you have received
                    </li>
                    <li>The dates and location of any hearing or interview</li>
                    <li>
                      Your account of what happened and any supporting documents
                    </li>
                    <li>
                      Photographs, messages, receipts, witness details or other
                      material that may support your account
                    </li>
                    {isMotoringOffence ? (
                      <li>
                        Details of your driving record and how a conviction or
                        disqualification would affect other people
                      </li>
                    ) : (
                      <li>
                        How a conviction would affect your work, your family and
                        anyone who depends on you
                      </li>
                    )}
                    <li>
                      Your main concerns and the questions you want answered
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="eyebrow">
                    <span className="small-rule" /> Your case, considered
                    carefully
                  </p>
                  <h2 id="your-options" className="display-heading">
                    Clarity first.
                    <br />
                    <em>Then light at the end of the tunnel</em>
                  </h2>
                  <p>
                    Every case has its own circumstances. John will take the
                    time to understand what has happened, review the material
                    available and explain how he can assist.
                  </p>
                  <h3 id="what-to-share">What to share with me</h3>
                  <ul>
                    <li>
                      Any notice, letter or charge paperwork you have received
                    </li>
                    <li>The dates and location of any hearing or interview</li>
                    <li>
                      Your account of what happened and any supporting documents
                    </li>
                    <li>
                      Your main concerns and the questions you want answered
                    </li>
                  </ul>
                </>
              )}
              <h3 id="personal-representation">Personal representation</h3>
              <p>
                When you instruct me, you deal directly with me. I will ensure
                that you clearly understand the proposed work and what it will
                cost.
              </p>
              <Link href="/services" className="text-link">
                Explore all areas of practice{" "}
                <Icon name="arrowRight" size={17} />
              </Link>
            </div>
            <div className="page-rail">
              <OnThisPage items={sections} />
              <aside className="service-contact-card">
                <span className="eyebrow">Speak directly to John</span>
                <h2>
                  It starts with
                  <br />
                  <em>a conversation.</em>
                </h2>
                <p>
                  A free initial consultation. A chance to explain your
                  situation and understand the next step.
                </p>
                <Link href={siteConfig.bookingUrl} className="action-button">
                  Discuss your case <Icon name="arrowRight" size={17} />
                </Link>
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-contact-whatsapp"
                  >
                    <Icon name="whatsapp" size={16} />
                    Message John on WhatsApp
                  </a>
                ) : null}
                <span className="service-contact-caption">
                  20+ years in criminal defence
                  <br />
                  Representing clients across England & Wales
                </span>
              </aside>
              <aside className="service-fee-card">
                <span className="eyebrow">Fees and next steps</span>
                <h2>Know the proposed work before you decide.</h2>
                <p>
                  Review the current draft schedule, then confirm the scope and
                  fee for your own case directly with John.
                </p>
                <Link href="/fees" className="text-link">
                  View the fee guide <Icon name="arrowRight" size={15} />
                </Link>
              </aside>
            </div>
          </div>
          {related.length > 0 && (
            <div className="related-services">
              <p className="eyebrow">Related areas</p>
              {related.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.name}
                  <Icon name="arrowRight" size={18} />
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
      <CtaBanner
        heading="Your questions matter."
        emphasis="Let’s talk them through."
      />
    </>
  );
}
