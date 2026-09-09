import Link from "next/link";

import { featuredServices } from "@/lib/content/services";

/**
 * Slim rail of the most common charges beneath the trust band — gives a visitor
 * who arrived with one specific charge in mind an immediate route to it. The
 * full catalogue lives in the header's services menu.
 */
export function OffenceStrip() {
  return (
    <nav
      aria-label="Common charges"
      className="border-b border-white/5 bg-navy-mid"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-1 py-2.5 lg:flex-row lg:items-center lg:gap-5">
          <p className="shrink-0 px-2.5 text-[10px] font-bold tracking-[0.2em] text-gold/80 uppercase lg:px-0">
            What I defend
          </p>
          <ul className="flex flex-wrap items-center gap-x-0.5 gap-y-0.5">
            {featuredServices.map((service) => (
              <li key={service.href}>
                <Link
                  href={service.href}
                  className="block rounded-sharp px-2.5 py-1.5 text-[12px] whitespace-nowrap text-cream/58 transition-colors hover:bg-gold/10 hover:text-gold-light"
                >
                  {service.short ?? service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
