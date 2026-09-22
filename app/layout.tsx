import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  DM_Sans,
  Mrs_Saint_Delafield,
  Playfair_Display,
} from "next/font/google";

import { VersionGuard } from "@/components/layout/version-guard";
import { getSiteConfig } from "@/lib/cms/queries";
import { deployment } from "@/lib/site-config";
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

/**
 * `generateMetadata` rather than a static object, so the name in every page
 * title follows the setting.
 *
 * `metadataBase` stays on `deployment`: the canonical domain decides every
 * canonical URL on the site, and it belongs with the deploy that serves it
 * rather than with something editable from a browser.
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    metadataBase: new URL(deployment.url),
    title: {
      default: `${config.name} — Criminal Defence & Motoring Offence Solicitor`,
      template: `%s | ${config.name}`,
    },
    description:
      "John Violaris is a criminal defence solicitor specialising in motoring offences and police station representation across England and Wales. You deal directly with John.",
    applicationName: config.name,
    authors: [{ name: config.name }],
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
      shortcut: ["/favicon.svg"],
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: config.name,
      url: deployment.url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${playfair.variable} ${dmSans.variable} ${signature.variable} h-full`}
    >
      <body className="min-h-full bg-cream">
        {children}
        <VersionGuard />
      </body>
    </html>
  );
}
