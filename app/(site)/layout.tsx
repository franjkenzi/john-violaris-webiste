import type { ReactNode } from "react";

import { MobileContactBar } from "@/components/layout/mobile-contact-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { UtilityBar } from "@/components/layout/utility-bar";
import { ReviewSolicitorsWidget } from "@/components/ui/review-solicitors";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-cream">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-sharp focus:bg-gold focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:tracking-wider focus:text-navy focus:uppercase"
      >
        Skip to content
      </a>
      <UtilityBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <MobileContactBar />
      {/*
        ReviewSolicitors pins this to the right edge of the viewport, vertically
        centred, so it clears the contact bar docked along the bottom. It lives
        in the layout rather than on a page so the tab survives client-side
        navigation instead of reloading itself on every route change.
      */}
      <ReviewSolicitorsWidget widget="side" elementId="rswidget_35c26" />
    </div>
  );
}
