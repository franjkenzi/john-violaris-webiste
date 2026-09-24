import type { IconName } from "@/components/ui/icons";

/**
 * Home page content.
 *
 * Kept as plain data so these sections can be driven by the CMS later without
 * touching the components that render them.
 */

export type TrustStat = {
  value: string;
  label: string;
};

export type ValueCard = {
  icon: IconName;
  title: string;
  body: string;
};

export type ServiceCard = {
  icon: IconName;
  title: string;
  /** Statute the offence sits under — verify before launch. */
  statute: string;
  body: string;
  href: string;
};

export type ProcessStep = {
  title: string;
  body: string;
};

export type Testimonial = {
  quote: string;
  /** As the reviewer published it on ReviewSolicitors, not as John records it. */
  name: string;
  /** The area of law the platform tagged. Absent on a review it left untagged. */
  matter?: string;
  rating: number;
  /** Where the review was collected. Set only where a real one can be pointed at. */
  source?: string;
};

export type Milestone = {
  year: string;
  title: string;
};

export const trustStats: TrustStat[] = [
  { value: "20+", label: "Years in criminal defence" },
  { value: "10,000+", label: "Clients represented" },
  { value: "2005", label: "Qualified as a solicitor" },
  { value: "Fixed", label: "Transparent, agreed fees" },
  { value: "Free", label: "Initial consultation" },
];

/** First-person introduction — John speaking directly to the visitor. */
export const johnIntro = {
  eyebrow: "Meet your solicitor",
  heading: "I'm John Violaris.",
  headingEmphasis: "I'll be the one handling your case.",
  paragraphs: [
    "I qualified as a solicitor in 2005 and have spent every year since in active criminal defence practice — first at the police station, then in the magistrates' courts across England and Wales.",
    "Most people who call me have never been in trouble before. They are worried about their licence, their job, and what their family will think. My first job is to tell you honestly where you stand, and my second is to do something about it.",
    "You will not be passed to a paralegal or a locum agent. The solicitor who takes your first call is the one who reads your evidence, writes your submissions, and stands up in court with you.",
  ],
};

export const credentials: string[] = [
  "Qualified solicitor since 2005",
  "LLB (Hons) Law — University of Bristol",
  "Regulated by the SRA",
  "Police station accredited since 2003",
  "Practising across England & Wales",
];

export const milestones: Milestone[] = [
  { year: "2001", title: "LLB (Hons), University of Bristol" },
  { year: "2002", title: "Legal Practice Course, UWE Bristol" },
  { year: "2003", title: "Training contract" },
  { year: "2005", title: "Admitted as a solicitor" },
  { year: "2014", title: "Qualified as a duty solicitor" },
  { year: "Today", title: "Motoring & criminal defence practice" },
];

export const valueCards: ValueCard[] = [
  {
    icon: "scales",
    title: "One solicitor, start to finish",
    body: "The solicitor you speak to on the phone is the one who presents your evidence and stands up for you in court. No hand-offs, no agents.",
  },
  {
    icon: "pound",
    title: "Fixed fees, agreed up front",
    body: "You’ll know exactly what your case costs before you instruct me. No hourly meter, no open-ended billing, no unexpected invoices.",
  },
  {
    icon: "history",
    title: "Two decades of criminal practice",
    body: "Qualified in 2005 and have been representing clients ever since. I know how these hearings run and how the Court thinks.",
  },
  {
    icon: "target",
    title: "Honest advice, not sales talk",
    body: "I will tell you if you have a defence worth running — and I will tell you just as plainly when mitigation is the better route.",
  },
];

export const homeServices: ServiceCard[] = [
  {
    icon: "glass",
    title: "Drink & Drug Driving",
    statute: "s.5 & s.5A Road Traffic Act 1988",
    body: "A conviction carries a mandatory minimum 12-month disqualification. I examine the procedure, the sampling, the evidence — and where guilt is not in dispute, the special reasons and mitigation open to you.",
    href: "/services/drink-driving",
  },
  {
    icon: "points",
    title: "Totting Up & 12 Points",
    statute: "s.35 Road Traffic Offenders Act 1988",
    body: "Twelve points in three years means a six-month ban unless exceptional hardship is established. That is a high threshold, and it is won on evidence prepared properly and early.",
    href: "/services/totting-up",
  },
  {
    icon: "spark",
    title: "Special Reasons",
    statute: "s.34 Road Traffic Offenders Act 1988",
    body: "A special reasons argument can prevent disqualification even where the offence is admitted — laced drinks, a genuine emergency, a very short distance driven.",
    href: "/services/special-reasons",
  },
  {
    icon: "camera",
    title: "Speeding",
    statute: "s.89 Road Traffic Regulation Act 1984",
    body: "Notice of Intended Prosecution validity, device calibration, service and timing requirements. I advise on every avenue before you accept points you may not have to take.",
    href: "/services/speeding",
  },
  {
    icon: "phone",
    title: "Mobile Phone & Careless",
    statute: "s.41D & s.3 Road Traffic Act 1988",
    body: "Both carry a real disqualification risk once points are added to an existing record. I advise on whether the charge is properly made out and how best to answer it.",
    href: "/services/mobile-phone",
  },
  {
    icon: "document",
    title: "No Insurance & Licence",
    statute: "s.143 Road Traffic Act 1988",
    body: "Six to eight mandatory points or a discretionary ban. Special reasons can avoid endorsement where there was a genuine and reasonable belief that cover was in place.",
    href: "/services/no-insurance",
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Free initial chat",
    body: "Call or email me and I will tell you honestly where you stand. No charge, no obligation, no sales pitch.",
  },
  {
    title: "Case review",
    body: "I read the prosecution evidence line by line and advise on your real prospects — contest, plead, or special reasons.",
  },
  {
    title: "Preparation",
    body: "I handle the correspondence, gather the supporting evidence, draft the submissions, and brief you before every hearing.",
  },
  {
    title: "Court representation",
    body: "I attend every hearing with you and do the advocacy myself. One solicitor throughout — me.",
  },
];

/**
 * The reviews on John's ReviewSolicitors profile, transcribed from it, newest
 * first as the profile lists them.
 *
 * There are three of them, all verified and all five stars, and `/reviews`
 * serves the same three in full straight from ReviewSolicitors — so what the
 * homepage says and what the visitor finds on clicking through are the same
 * reviews. The section repeats them rather than padding the gap with writing,
 * and fills out on its own as real ones are added here.
 *
 * Every word is the reviewer's. Teni's is the opening paragraph of a longer
 * review and Henry's is quoted from the middle of one — the whole of each is on
 * the profile — and Joanna's is her review entire. PRD §17: nothing invented,
 * and nothing presented as verified that cannot be pointed at.
 *
 * Source: https://www.reviewsolicitors.co.uk/london/london/ioannis-violaris
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "I had an excellent experience with John throughout my driving offence case. He was extremely articulate, knowledgeable, supportive and reassuring from start to finish.",
    name: "Teni",
    matter: "Driving offences",
    rating: 5,
    source: "ReviewSolicitors",
  },
  {
    quote:
      "John explained the situation clearly, identified that the prosecution’s evidence had weaknesses, and negotiated a resolution that kept me on the road. He was the only solicitor I called who actually listened to the details before quoting me.",
    name: "Henry Parsons",
    matter: "Driving offences",
    rating: 5,
    source: "ReviewSolicitors",
  },
  {
    // Left untagged on the platform, so it carries no area of law here either.
    quote:
      "Fantastic service and excellent communication. Very reasonably priced and would highly recommend. Thank you!",
    name: "Joanna",
    rating: 5,
    source: "ReviewSolicitors",
  },
];
