"use client";

import { createContext, use, type ReactNode } from "react";

import { fallbackSiteConfig, type SiteConfig } from "@/lib/site-config";

/**
 * The resolved site configuration, for client components.
 *
 * The header, the services menu, the docked contact bar, the hero and the
 * enquiry form are all client components — they need scroll listeners, focus
 * traps and `useActionState` — so none of them can read from Supabase. The site
 * layout is a Server Component, reads the configuration once, and hands it down
 * through here.
 *
 * `SiteConfig` is plain data, which is what makes that crossing legal: a
 * function cannot be serialised as a prop, so `whatsappHref` is a standalone
 * function taking the config rather than a method on it.
 *
 * The default is the static configuration rather than `null`. A client
 * component rendered outside the site layout — a preview, a test, the error
 * boundary — then shows the built-in details instead of throwing, which is the
 * same thing the whole settings layer does when a value has no row.
 */
const SiteConfigContext = createContext<SiteConfig>(fallbackSiteConfig);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return use(SiteConfigContext);
}
