import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  DM_Sans,
  Mrs_Saint_Delafield,
  Playfair_Display,
} from "next/font/google";

import { VersionGuard } from "@/components/layout/version-guard";
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
