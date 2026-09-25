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
import { JsonLd } from "@/components/ui/json-ld";
import { getPagesContent, getSiteConfig } from "@/lib/cms/queries";
import { graph, webPageNode } from "@/lib/cms/seo/json-ld";
import { seoMetadataFor, structuredDataFor } from "@/lib/cms/seo/metadata";
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

/** Title, description and sharing tags, from the route registry and any SEO override. */
export function generateMetadata(): Promise<Metadata> {
  return seoMetadataFor("/");
}

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
  const config = await getSiteConfig();
  const structured = await structuredDataFor("/", config.name);
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
      {/* The practice and John, and nothing page-specific: the home page has
          no breadcrumb, and its questions are marked up on /fees, where they
          are edited, since Google wants a repeated FAQ marked up once. */}
      <JsonLd
        data={graph([
          ...structured.site,
          webPageNode({ page: structured.page, hasBreadcrumb: false }),
        ])}
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
      <CtaBanner content={shared("cta", ctaDefaults)} config={config} />
    </>
  );
}
