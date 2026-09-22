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
import { getPagesContent } from "@/lib/cms/queries";
import { resolveFrom } from "@/lib/cms/sections/resolve";
import {
  ctaDefaults,
  feesPreviewDefaults,
  heroDefaults,
  meetJohnDefaults,
  offenceStripDefaults,
  policeStationDefaults,
  processDefaults,
  servicesIntroDefaults,
  testimonialsIntroDefaults,
  whyInstructDefaults,
} from "@/lib/content/pages";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Criminal Defence & Motoring Offence Solicitor — England & Wales",
  description:
    "Facing a driving ban, court hearing or police interview? John Violaris is a criminal defence solicitor with 20+ years' experience and 10,000+ clients represented. Free initial consultation.",
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

/**
 * The home page draws on five section groups, not one.
 *
 * Four of its bands also appear elsewhere — Meet John on /about, the police
 * station feature on /police-station, the questions on /fees, the process on
 * both — and each is edited where it belongs rather than duplicated per page.
 * `getPagesContent` fetches the lot in one round trip, and `resolveFrom` lays
 * whatever has been edited over the copy the page was written with.
 */
export default async function HomePage() {
  const content = await getPagesContent(
    "home",
    "about",
    "fees",
    "police-station",
    "services",
    "shared",
  );

  const home = resolveFrom(content.home);
  const about = resolveFrom(content.about);
  const fees = resolveFrom(content.fees);
  const police = resolveFrom(content["police-station"]);
  const services = resolveFrom(content.services);
  const shared = resolveFrom(content.shared);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero
        content={home("hero", heroDefaults)}
        strip={home("offence-strip", offenceStripDefaults)}
      />
      <ServicesGrid content={services("explorer", servicesIntroDefaults)} />
      <MeetJohn content={about("meet-john", meetJohnDefaults)} />
      <WhyInstruct content={home("why-instruct", whyInstructDefaults)} />
      <PoliceStation content={police("feature", policeStationDefaults)} />
      <ProcessSteps content={shared("process", processDefaults)} />
      <Testimonials content={home("testimonials", testimonialsIntroDefaults)} />
      <FeesPreview content={fees("preview", feesPreviewDefaults)} />
      <CtaBanner content={shared("cta", ctaDefaults)} />
    </>
  );
}
