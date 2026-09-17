"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { serviceGroups } from "@/lib/content/services";
import { serviceDescriptions } from "@/lib/content/service-descriptions";

export function ServicesGrid() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <section
      id="expertise"
      className="expertise-section section-space"
      aria-labelledby="expertise-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> How I can help
            </p>
            <h2 id="expertise-heading" className="display-heading">
              A clear way forward.
              <br />
              <em>Whatever you’re facing.</em>
            </h2>
          </div>
        </div>
        <div className="service-explorer">
          <div className="service-navigation">
            <div
              className="service-tabs"
              role="tablist"
              aria-label="Areas of practice"
              aria-orientation="vertical"
            >
              {serviceGroups.map((group, index) => (
                <button
                  key={group.heading}
                  ref={(el) => {
                    tabs.current[index] = el;
                  }}
                  id={`${id}-tab-${index}`}
                  role="tab"
                  aria-selected={active === index}
                  aria-controls={`${id}-panel-${index}`}
                  tabIndex={active === index ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => {
                    let next = index;
                    if (event.key === "ArrowDown" || event.key === "ArrowRight")
                      next = (index + 1) % serviceGroups.length;
                    else if (
                      event.key === "ArrowUp" ||
                      event.key === "ArrowLeft"
                    )
                      next =
                        (index - 1 + serviceGroups.length) %
                        serviceGroups.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End")
                      next = serviceGroups.length - 1;
                    else return;
                    event.preventDefault();
                    setActive(next);
                    tabs.current[next]?.focus();
                  }}
                  className={
                    active === index ? "service-tab active" : "service-tab"
                  }
                >
                  <span>{group.heading}</span>
                  <Icon name="arrowRight" size={17} />
                </button>
              ))}
            </div>
            <Link href="/services" className="all-services-link">
              View all services <span>↗</span>
            </Link>
          </div>
          {serviceGroups.map((group, index) => (
            <div
              key={group.heading}
              id={`${id}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${index}`}
              hidden={active !== index}
              tabIndex={0}
              className="service-panel"
            >
              <div className="service-cards">
                {group.services.map((service) => (
                  <Link
                    href={service.href}
                    key={service.href}
                    className="service-card"
                  >
                    <div className="service-card-top">
                      <Icon name={service.icon} size={25} />
                    </div>
                    <h3>{service.name.replace(" · ", " / ")}</h3>
                    <p>
                      {serviceDescriptions[service.href]?.intro ??
                        "Personal advice and representation, with a clear explanation of your options at every stage."}
                    </p>
                    <span className="service-card-action">
                      Explore this service <Icon name="arrowRight" size={17} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="expertise-note">
          <span>Not sure where your situation fits?</span>
          <Link href="/contact">
            Tell me what’s happened. We’ll take it from there.{" "}
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
