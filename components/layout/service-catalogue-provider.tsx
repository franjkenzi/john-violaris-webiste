"use client";

import { createContext, use, type ReactNode } from "react";

import type { ServiceGroup } from "@/lib/content/services";

/**
 * The service catalogue, for client components.
 *
 * The same arrangement as `SiteConfigProvider`, for the same reason. The
 * services menu, the offence rail inside the hero and the services explorer are
 * client components — hover timers, tab state — so none of them can read from
 * Supabase. The site layout reads the catalogue once and hands it down through
 * here, and every page gets the same answer the header got.
 *
 * `descriptions` travels beside the groups rather than on each service because
 * that is the shape the explorer already reads, keyed by href.
 *
 * The default is empty rather than the static catalogue. Nothing outside the
 * site layout renders these components today, and importing the seed here to
 * cover the case would put every service's copy into the client bundle.
 */
export type ServiceCatalogue = {
  groups: ServiceGroup[];
  descriptions: Record<string, { intro: string }>;
};

const ServiceCatalogueContext = createContext<ServiceCatalogue>({
  groups: [],
  descriptions: {},
});

export function ServiceCatalogueProvider({
  catalogue,
  children,
}: {
  catalogue: ServiceCatalogue;
  children: ReactNode;
}) {
  return (
    <ServiceCatalogueContext.Provider value={catalogue}>
      {children}
    </ServiceCatalogueContext.Provider>
  );
}

export function useServiceCatalogue(): ServiceCatalogue {
  return use(ServiceCatalogueContext);
}
