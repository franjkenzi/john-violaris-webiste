/**
 * What is covered at each stage of instructing John.
 *
 * The comparison describes scope of work, never price: the site publishes no
 * fee figures.
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
