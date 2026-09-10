import type { Metadata } from "next";
import {
  DM_Sans,
  Mrs_Saint_Delafield,
  Playfair_Display,
} from "next/font/google";

import { MobileContactBar } from "@/components/layout/mobile-contact-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { UtilityBar } from "@/components/layout/utility-bar";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const signature = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-signature",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Criminal Defence & Motoring Offence Solicitor`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "John Violaris is a criminal defence solicitor specialising in motoring offences and police station representation across England and Wales. You deal directly with John.",
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${playfair.variable} ${dmSans.variable} ${signature.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-cream">
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
      </body>
    </html>
  );
}
