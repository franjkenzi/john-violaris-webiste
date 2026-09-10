import Link from "next/link";

import { featuredServices } from "@/lib/content/services";

/**
 * Slim rail of the most common charges, closing the dark hero. Gives a visitor
 * who arrived with one specific charge in mind an immediate route to it — the
 * full catalogue lives in the header's services menu.
 */
export function OffenceStrip() {
  return (
    <nav aria-label="Common charges" className="offence-strip">
      <div className="offence-strip-inner">
        <p className="eyebrow">
          <span className="small-rule" /> What I defend
        </p>
        <ul>
          {featuredServices.map((service) => (
            <li key={service.href}>
              <Link href={service.href}>{service.short ?? service.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
