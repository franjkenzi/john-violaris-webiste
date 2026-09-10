"use client";

import { useState } from "react";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import {
  feeInclusions,
  feeStages,
  stageIncludes,
  type FeeStageKey,
} from "@/lib/content/fees";

/**
 * What each stage of instruction covers.
 *
 * On a wide screen all three stages are compared side by side. On a narrow one
 * the table collapses to the selected stage alone — a three-column comparison
 * at phone width is unreadable, and the selector is what makes that work.
 */
export function FeesMatrix() {
  const [stage, setStage] = useState<FeeStageKey>("review");

  return (
    <section
      className="scope-section section-space"
      aria-labelledby="fee-scope-heading"
    >
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> What is covered
            </p>
            <h2 id="fee-scope-heading" className="display-heading">
              Know what you are
              <br />
              <em>paying for.</em>
            </h2>
          </div>
          <p className="section-intro">
            Three stages, and what each one includes.
            <br />
            Choose a stage to compare.
          </p>
        </div>

        <div className="scope-stages" role="group" aria-label="Stage of instruction">
          {feeStages.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStage(item.key)}
              aria-pressed={stage === item.key}
              className={stage === item.key ? "scope-stage active" : "scope-stage"}
            >
              <span className="scope-stage-name">{item.name}</span>
              <span className="scope-stage-blurb">{item.blurb}</span>
            </button>
          ))}
        </div>

        <div className="scope-table" data-stage={stage}>
          <div className="scope-row scope-row-head">
            <span className="scope-item">Included</span>
            {feeStages.map((item) => (
              <span key={item.key} className="scope-cell" data-col={item.key}>
                {item.name}
              </span>
            ))}
          </div>
          {feeInclusions.map((inclusion) => (
            <div key={inclusion.name} className="scope-row">
              <span className="scope-item">{inclusion.name}</span>
              {feeStages.map((item) => {
                const included = stageIncludes(inclusion.from, item.key);
                return (
                  <span key={item.key} className="scope-cell" data-col={item.key}>
                    {/* The stage name is repeated for screen readers, which do
                        not get the column header from a CSS grid. */}
                    <span className="sr-only">
                      {item.name}: {included ? "included" : "not included"}
                    </span>
                    {included ? (
                      <Icon name="check" size={15} />
                    ) : (
                      <span aria-hidden="true" className="scope-absent">
                        &ndash;
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <p className="scope-note">
          No prices are published here. What John charges depends on the
          allegation, the evidence and the stage your case has reached — he will
          discuss the work involved and the fee with you before you decide
          whether to instruct him.
        </p>
      </Container>
    </section>
  );
}
