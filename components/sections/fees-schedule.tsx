import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { Lines } from "@/components/ui/lines";
import { additionalDraftFee, draftFees } from "@/lib/content/fees";
import { feesScheduleDefaults } from "@/lib/content/pages";
import type { SectionHeading } from "@/lib/content/pages";

export function FeesSchedule({
  content = feesScheduleDefaults,
}: {
  content?: SectionHeading;
}) {
  const rows = [
    ...draftFees.map(({ name, description, price }) => ({
      name,
      description,
      price,
    })),
    additionalDraftFee,
  ];

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
          {draftFees.map((fee) => (
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
            <caption>Complete draft fee schedule from the supplied reference</caption>
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Description</th>
                <th scope="col">Draft fee</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row">{row.name}</th>
                  <td>{row.description}</td>
                  <td>{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="draft-fee-notes">
          <p>
            <strong>Included work:</strong> The reference states that fixed
            fees include preparatory work and an inter-hearing consultation
            where relevant.
          </p>
          <p>
            <strong>Travel:</strong> Any travel or accommodation needed for a
            case outside London should be discussed and agreed in advance.
          </p>
          <p>
            <strong>Before publication:</strong> John must confirm every fee,
            what it includes, his VAT status and the applicable travel terms.
          </p>
        </div>
      </Container>
    </section>
  );
}
