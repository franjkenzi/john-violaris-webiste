import { Container } from "@/components/ui/container";

const matterTypes = [
  "Drink driving",
  "Drug driving",
  "Totting up / 12+ points",
  "Exceptional hardship",
  "Special reasons",
  "Speeding",
  "Dangerous driving",
  "Careless driving",
  "Mobile phone whilst driving",
  "Driving without insurance",
  "Failing to stop or report",
  "Section 172 / driver details",
  "Police station — motoring",
  "Police station — another offence",
  "Other / not sure",
];

export function ContactEnquiryPlaceholder() {
  return (
    <section className="enquiry-section section-space" aria-labelledby="enquiry-heading">
      <Container>
        <div className="enquiry-layout">
          <div>
            <p className="eyebrow">
              <span className="small-rule" /> Enquiry form preview
            </p>
            <h2 id="enquiry-heading" className="display-heading">
              Tell John about
              <br />
              <em>your case.</em>
            </h2>
            <p className="enquiry-intro">
              This is the planned enquiry form. Online submission is not active
              yet, so please use the direct email, telephone or WhatsApp options
              below for now.
            </p>
          </div>

          <form className="enquiry-form" aria-describedby="enquiry-preview-note">
            <fieldset disabled>
              <legend className="sr-only">Case enquiry details</legend>
              <div className="enquiry-form-row">
                <label>
                  <span>First name</span>
                  <input type="text" name="firstName" autoComplete="given-name" />
                </label>
                <label>
                  <span>Last name</span>
                  <input type="text" name="lastName" autoComplete="family-name" />
                </label>
              </div>
              <div className="enquiry-form-row">
                <label>
                  <span>Phone number</span>
                  <input type="tel" name="phone" autoComplete="tel" />
                </label>
                <label>
                  <span>Email address</span>
                  <input type="email" name="email" autoComplete="email" />
                </label>
              </div>
              <label>
                <span>Type of matter</span>
                <select name="matter" defaultValue="">
                  <option value="">Please select</option>
                  {matterTypes.map((matter) => (
                    <option key={matter} value={matter}>
                      {matter}
                    </option>
                  ))}
                </select>
              </label>
              <div className="enquiry-form-row">
                <label>
                  <span>Court or interview date, if known</span>
                  <input type="text" name="date" placeholder="For example, 15 March 2026" />
                </label>
                <label>
                  <span>Court or police station, if known</span>
                  <input type="text" name="location" />
                </label>
              </div>
              <label>
                <span>Brief description of your case</span>
                <textarea name="description" rows={6} />
              </label>
              <button type="button" disabled>
                Send enquiry
              </button>
            </fieldset>
            <p id="enquiry-preview-note" className="enquiry-preview-note">
              Preview only—this form does not send or store information.
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}
