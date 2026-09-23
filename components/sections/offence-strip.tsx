"use client";

import Link from "next/link";

import { useServiceCatalogue } from "@/components/layout/service-catalogue-provider";
import { offenceStripDefaults } from "@/lib/content/pages";

/**
 * Slim rail of the most common charges, closing the dark hero. Gives a visitor
 * who arrived with one specific charge in mind an immediate route to it — the
 * full catalogue lives in the header's services menu.
 *
 * Which charges appear is the "Show in the rail" box on each service in the
 * CMS, and they run in catalogue order.
 */
export function OffenceStrip({
  content = offenceStripDefaults,
}: {
  content?: { eyebrow: string };
}) {
  const { groups } = useServiceCatalogue();
  const featured = groups
    .flatMap((group) => group.services)
    .filter((service) => service.featured);

  return (
    <nav aria-label="Common charges" className="offence-strip">
      <div className="offence-strip-inner">
        <p className="eyebrow">
          <span className="small-rule" /> {content.eyebrow}
        </p>
        <ul>
          {featured.map((service) => (
            <li key={service.href}>
              <Link href={service.href}>{service.short ?? service.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
