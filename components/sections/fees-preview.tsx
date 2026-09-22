import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { Lines, Paragraphs } from "@/components/ui/lines";
import { feesPreviewDefaults } from "@/lib/content/pages";
import type { FeesPreviewContent } from "@/lib/content/pages";

export function FeesPreview({
  content = feesPreviewDefaults,
}: {
  content?: FeesPreviewContent;
}) {
  return (
    <section
      className="questions-section section-space"
      aria-labelledby="questions-heading"
    >
      <Container>
        <div className="questions-grid">
          <div className="fees-note">
            <p className="eyebrow">
              <span className="small-rule" /> {content.eyebrow}
            </p>
            <h2 id="questions-heading" className="display-heading">
              <Lines values={content.headline} />
              <br />
              {content.headlineEmphasisLead}{" "}
              <em>{content.headlineEmphasis}</em>
            </h2>
            <Paragraphs values={content.body} />
            <Link href="/fees" className="text-link">
              {content.linkLabel} <Icon name="arrowRight" size={17} />
            </Link>
          </div>
          <div className="questions-list">
            {content.questions.map((item, index) => (
              <details key={item.question} name="home-questions">
                <summary>
                  <span className="question-number">0{index + 1}</span>
                  <span>{item.question}</span>
                  <span className="question-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
