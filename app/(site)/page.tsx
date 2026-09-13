import type { Metadata } from "next";

import { CtaBanner } from "@/components/layout/cta-banner";
import { FeesPreview } from "@/components/sections/fees-preview";
import { Hero } from "@/components/sections/hero";
import { MeetJohn } from "@/components/sections/meet-john";
import { PoliceStation } from "@/components/sections/police-station";
import { ProcessSteps } from "@/components/sections/process-steps";
import { ServicesGrid } from "@/components/sections/services-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { WhyInstruct } from "@/components/sections/why-instruct";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Criminal Defence & Motoring Offence Solicitor — England & Wales",
  description:
    "Facing a driving ban, court hearing or police interview? John Violaris is a criminal defence solicitor with 20+ years' experience and 10,000+ police station attendances. Free initial consultation.",
  alternates: { canonical: "/" },
};

/** Schema.org markup for the practice and for John himself. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LegalService",
      "@id": `${siteConfig.url}#practice`,
      name: siteConfig.name,
      url: siteConfig.url,
      description:
        "Criminal defence solicitor specialising in motoring offences and police station representation across England and Wales.",
      areaServed: {
        "@type": "AdministrativeArea",
        name: siteConfig.jurisdiction,
      },
      provider: { "@id": `${siteConfig.url}#john` },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}#john`,
      name: siteConfig.name,
      jobTitle: siteConfig.role,
      url: siteConfig.url,
      knowsAbout: [
        "Drink driving",
        "Drug driving",
        "Totting up and exceptional hardship",
        "Special reasons",
        "Speeding offences",
        "Police station representation",
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <ServicesGrid />
      <MeetJohn />
      <WhyInstruct />
      <PoliceStation />
      <ProcessSteps />
      <Testimonials />
      <FeesPreview />
      <CtaBanner heading="Let’s take the" emphasis="next step. Together." />
    </>
  );
}
