/**
 * What is covered at each stage of instructing John.
 *
 * The comparison describes scope of work. A separate draft schedule lower in
 * this file preserves the figures supplied in the reference HTML, but the UI
 * identifies them as unconfirmed until John has approved the prices, VAT
 * position, inclusions and travel terms.
 */

export type FeeStageKey = "consultation" | "review" | "representation";

export type FeeStage = {
  key: FeeStageKey;
  name: string;
  /** Shown under the stage name in the selector. */
  blurb: string;
};

export type FeeInclusion = {
  name: string;
  /** The earliest stage that includes this; every later stage includes it too. */
  from: FeeStageKey;
};

export type DraftFee = {
  name: string;
  description: string;
  price: string;
  included: string[];
  /**
   * Listed in the full table but given no card of its own.
   *
   * The adjourned-hearing fee is an add-on to another instruction rather than
   * a way to instruct John, so a card offering it alongside the six real ones
   * would misrepresent what it is.
   */
  tableOnly?: boolean;
};

/**
 * Draft figures carried over from the supplied full-site HTML reference.
 * They are deliberately labelled as unconfirmed wherever they are rendered:
 * pricing, VAT status and travel terms must be approved by John before launch.
 */
export const draftFees: DraftFee[] = [
  {
    name: "Police station",
    description: "Any police station, England & Wales",
    price: "£400",
    included: [
      "Pre-interview disclosure review",
      "Private consultation before interview",
      "Attendance at interview",
      "Advice on bail or release conditions",
    ],
  },
  {
    name: "Single hearing",
    description: "Magistrates’ Court — guilty plea or first appearance",
    price: "£600",
    included: [
      "Full case review and evidence analysis",
      "Pre-hearing consultation",
      "All preparatory work",
      "Court attendance and representation",
      "Mitigation submissions where required",
    ],
  },
  {
    name: "First appearance & trial",
    description: "Two-hearing case",
    price: "£1,200",
    included: [
      "Full defence preparation",
      "Evidence and disclosure review",
      "Pre-trial correspondence",
      "Attendance at both hearings",
      "Trial advocacy",
    ],
  },
  {
    name: "Three-hearing case",
    description: "First appearance, trial and sentence",
    price: "£1,500",
    included: [
      "Preparation and correspondence",
      "Attendance at all three hearings",
      "Trial advocacy",
      "Sentencing attendance",
      "Inter-hearing consultation",
    ],
  },
  {
    name: "Exceptional hardship",
    description: "Full preparation and hearing",
    price: "£750",
    included: [
      "Detailed case analysis",
      "Evidence gathering and preparation",
      "Written submissions where required",
      "Court representation",
    ],
  },
  {
    name: "Special reasons",
    description: "Single or double hearing",
    price: "£750 / £1,100",
    included: [
      "Preparation and evidence review",
      "Expert evidence coordination where required",
      "Written legal submissions",
      "Court representation throughout",
    ],
  },
];

/**
 * The adjourned-hearing fee: in the table, not on a card.
 *
 * A full `DraftFee` rather than the bare three fields it used to be, so that it
 * goes through the same seed, the same mapper and the same editor as the rest.
 * It was the one figure on the fees page that no admin screen could reach.
 */
export const additionalDraftFee: DraftFee = {
  name: "Additional or adjourned hearing",
  description: "Case management or an adjourned hearing",
  price: "£500",
  included: [],
  tableOnly: true,
};

/** Every fee, in the order the table lists them. */
export const allDraftFees: DraftFee[] = [...draftFees, additionalDraftFee];

export const feeStages: FeeStage[] = [
  {
    key: "consultation",
    name: "Initial consultation",
    blurb: "Free, and with no obligation to go further.",
  },
  {
    key: "review",
    name: "Case review",
    blurb: "The evidence read properly, and advice you can act on.",
  },
  {
    key: "representation",
    name: "Full representation",
    blurb: "Preparation and advocacy, through to the final hearing.",
  },
];

/** Ordered so each stage's additions read as a group. */
export const feeInclusions: FeeInclusion[] = [
  { name: "A conversation with John himself", from: "consultation" },
  { name: "An honest view of where you stand", from: "consultation" },
  { name: "Your options explained in plain English", from: "consultation" },
  { name: "The scope of work and the fee agreed before you commit", from: "review" },
  { name: "The prosecution evidence read line by line", from: "review" },
  { name: "Advice on contesting, pleading or special reasons", from: "review" },
  { name: "Correspondence with the court and the CPS", from: "representation" },
  { name: "Supporting evidence gathered and submissions drafted", from: "representation" },
  { name: "A briefing before every hearing", from: "representation" },
  { name: "John attends each hearing and does the advocacy himself", from: "representation" },
];

const order: FeeStageKey[] = ["consultation", "review", "representation"];

/** Whether `stage` includes an item first offered at `from`. */
export function stageIncludes(from: FeeStageKey, stage: FeeStageKey): boolean {
  return order.indexOf(stage) >= order.indexOf(from);
}
