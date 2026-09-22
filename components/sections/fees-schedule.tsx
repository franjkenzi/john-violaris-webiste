import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { Lines } from "@/components/ui/lines";
import type { Fee } from "@/lib/cms/types";
import { allDraftFees } from "@/lib/content/fees";
import { feesScheduleDefaults } from "@/lib/content/pages";
import type { FeesScheduleContent } from "@/lib/content/pages";

/**
 * The fee schedule: a card for each way to instruct John, then every fee in
 * one table.
 *
 * `fees` comes from the CMS. A fee marked `tableOnly` is listed in the table
 * but given no card — the adjourned-hearing fee is an add-on to an instruction
 * rather than a way to instruct, and a card offering it beside the six real
 * ones would misrepresent what it is.
 *
 * The default is the static schedule, so a caller that has not been given fees
 * still renders the page as written. In practice `/fees` always passes them.
 */
export function FeesSchedule({
  content = feesScheduleDefaults,
  fees = fallbackFees,
}: {
  content?: FeesScheduleContent;
  fees?: Fee[];
}) {
  const cards = fees.filter((fee) => !fee.tableOnly);

  return (
    <section className="draft-fees-section section-space" aria-labelledby="draft-fees-heading">
      <Container>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> {content.eyebrow}
            </p>
            <h2 id="draft-fees-heading" className="display-heading">
              <Lines values={content.headline} />
              <br />
              <em>
                <Lines values={content.headlineEmphasis} />
              </em>
            </h2>
          </div>
          {content.intro.length > 0 ? (
            <p className="section-intro">
              <Lines values={content.intro} />
            </p>
          ) : null}
        </div>

        <div className="draft-fee-grid">
          {cards.map((fee) => (
            <article key={fee.name} className="draft-fee-card">
              <div className="draft-fee-card-head">
                <div>
                  <h3>{fee.name}</h3>
                  <p>{fee.description}</p>
                </div>
                <strong>{fee.price}</strong>
              </div>
              <ul>
                {fee.included.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="draft-fee-table-wrap">
          <table className="draft-fee-table">
            <caption>{content.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Description</th>
                <th scope="col">Draft fee</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.name}>
                  <th scope="row">{fee.name}</th>
                  <td>{fee.description}</td>
                  <td>{fee.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {content.notes.length > 0 ? (
          <div className="draft-fee-notes">
            {content.notes.map((note) => (
              <p key={note.label + note.body}>
                {note.label ? <strong>{note.label}</strong> : null}{" "}
                {note.body}
              </p>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/**
 * The static schedule, in the shape the CMS hands over.
 *
 * Built from `allDraftFees` rather than written out again, so the fallback and
 * the seed cannot disagree about what a fee says.
 */
const fallbackFees: Fee[] = allDraftFees.map((fee) => ({
  name: fee.name,
  price: fee.price,
  description: fee.description,
  included: fee.included,
  ...(fee.tableOnly ? { tableOnly: true } : {}),
}));
