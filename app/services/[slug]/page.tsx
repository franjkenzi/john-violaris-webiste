import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/pages/page-intro";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { CtaBanner } from "@/components/layout/cta-banner";
import { allServices, serviceGroups } from "@/lib/content/services";
import { serviceDescriptions } from "@/lib/content/service-descriptions";
import { serviceDetails } from "@/lib/content/service-detail";
import { siteConfig } from "@/lib/site-config";

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
  const detail = serviceDetails[service.href];
  const related =
    serviceGroups
      .find((group) =>
        group.services.some((item) => item.href === service.href),
      )
      ?.services.filter((item) => item.href !== service.href) ?? [];
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
            <p className="penalty-caveat">
              A general guide only. What applies in your case depends on its own
              facts — John will explain where you stand.
            </p>
          </Container>
        </section>
      )}
      <section className="section-space">
        <Container>
          <div className="service-detail-grid">
            <div className="service-detail-copy">
              {detail ? (
                <>
                  <p className="eyebrow">
                    <span className="small-rule" /> {detail.issuesHeading}
                  </p>
                  <h2 className="display-heading">
                    Clarity first.
                    <br />
                    <em>Then a way forward.</em>
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
                  <h3>How the case proceeds</h3>
                  <ol className="detail-process">
                    {detail.process.map((step, index) => (
                      <li key={step.title}>
                        <span className="detail-process-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <strong>{step.title}</strong>
                          <p>{step.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <h3>What to share with John</h3>
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
              ) : (
                <>
                  <p className="eyebrow">
                    <span className="small-rule" /> Your case, considered
                    carefully
                  </p>
                  <h2 className="display-heading">
                    Clarity first.
                    <br />
                    <em>Then a way forward.</em>
                  </h2>
                  <p>
                    Every case has its own circumstances. John will take the
                    time to understand what has happened, review the material
                    available and explain how he can assist.
                  </p>
                  <h3>What to share with John</h3>
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
              <h3>Personal representation</h3>
              <p>
                You will discuss your case directly with John. Before you decide
                to instruct him, he will explain the proposed work and discuss
                fees with you.
              </p>
              <Link href="/services" className="text-link">
                Explore all areas of practice{" "}
                <Icon name="arrowRight" size={17} />
              </Link>
            </div>
            <aside className="service-contact-card">
              <span className="eyebrow">Speak directly to John</span>
              <h2>
                It starts with
                <br />
                <em>a conversation.</em>
              </h2>
              <p>
                A free initial consultation. A chance to explain your situation
                and understand the next step.
              </p>
              <Link href={siteConfig.bookingUrl} className="action-button">
                Discuss your case <Icon name="arrowRight" size={17} />
              </Link>
              <span className="service-contact-caption">
                20+ years in criminal defence
                <br />
                Representing clients across England & Wales
              </span>
            </aside>
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
