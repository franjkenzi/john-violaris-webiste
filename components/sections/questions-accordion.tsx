"use client";

import { useId, useState } from "react";
import type { Question } from "@/lib/content/pages";

/**
 * The expandable questions beside "Good advice starts with honesty".
 *
 * Buttons rather than `<details>`, because a closed `<details>` has no content
 * to animate: the answer would still appear and vanish in one frame, in every
 * browser that lacks `interpolate-size`. Here the answer is always rendered
 * and its row eases between `0fr` and `1fr`, which every current browser can
 * transition. `visibility` follows the row, so a closed answer is out of the
 * tab order and the accessibility tree, as a closed `<details>` would be.
 *
 * One answer open at a time, as the `name` attribute on the old `<details>`
 * gave: opening a question closes the one before, and both animate together.
 */
export function QuestionsAccordion({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <div className="questions-list">
      {questions.map((item, index) => {
        const isOpen = open === index;
        const buttonId = `${id}-question-${index}`;
        const answerId = `${id}-answer-${index}`;

        return (
          <div
            key={item.question}
            className="question"
            data-open={isOpen || undefined}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span className="question-number">0{index + 1}</span>
                <span>{item.question}</span>
                <span className="question-toggle" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div
              id={answerId}
              role="region"
              aria-labelledby={buttonId}
              className="question-answer"
            >
              <div>
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
