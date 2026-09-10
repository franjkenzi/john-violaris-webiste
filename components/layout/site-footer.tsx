import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { footerNav, mailtoHref, siteConfig, telHref } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="editorial-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-identity">
            <Logo />
            <p>
              Personal representation.
              <br />
              Clear advice. Direct access.
            </p>
            <span>
              Criminal defence & motoring offences
              <br />
              Across England & Wales
            </span>
          </div>
          {footerNav.map((column) => (
            <nav key={column.heading} aria-label={`Footer ${column.heading}`}>
              <p className="eyebrow">{column.heading}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="footer-contact">
            <p className="eyebrow">Your next step</p>
            <p>
              A conversation with John.
              <br />
              Free, and without obligation.
            </p>
            <Link href={siteConfig.bookingUrl}>
              Arrange a consultation <span>↗</span>
            </Link>

            {/*
              The practical detail the reference firms all publish — how to
              reach someone, how quickly they answer, where they work. Only
              confirmed routes appear.
            */}
            <dl className="footer-facts">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={mailtoHref}>{siteConfig.contact.email}</a>
                </dd>
              </div>
              {siteConfig.contact.phoneE164 ? (
                <div>
                  <dt>Telephone</dt>
                  <dd>
                    <a href={telHref}>{siteConfig.contact.phoneDisplay}</a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Response</dt>
                <dd>{siteConfig.contact.responseTime}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{siteConfig.jurisdiction}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} John Violaris. All rights reserved.
          </p>
          <span>
            Qualified since 2005{" "}
            {siteConfig.sraNumber ? `· SRA no. ${siteConfig.sraNumber}` : ""}
          </span>
          <a href="#main">Back to top ↑</a>
        </div>
        <p className="footer-legal">
          The information on this website is general guidance and is not legal
          advice for your specific circumstances. No outcome is guaranteed in
          any case.
        </p>
      </Container>
    </footer>
  );
}
