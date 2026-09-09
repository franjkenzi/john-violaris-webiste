import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="hero-editorial" aria-labelledby="hero-heading">
      <Container>
        <div className="hero-topline">
          <span>Independent criminal defence</span>
          <span>England & Wales</span>
        </div>
        <div className="hero-composition">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="small-rule" /> John Violaris · Solicitor
            </p>
            <h1 id="hero-heading">
              Your future.
              <br />
              Your defence.
              <br />
              <em>
                My personal
                <br className="mobile-break" /> attention.
              </em>
            </h1>
            <p className="hero-description">
              Your licence. Your livelihood. Your peace of mind.
              <br className="hidden sm:block" /> When the stakes feel high,
              speak directly to the solicitor who will stand beside you.
            </p>
            <Link href={siteConfig.bookingUrl} className="action-button">
              Let’s talk about your case <Icon name="arrowRight" size={19} />
            </Link>
            <p className="hero-reassurance">
              Free initial consultation <span>·</span> No obligation
            </p>
          </div>
          <aside className="hero-letter" aria-label="John’s approach">
            <div className="letter-top">
              <span>A personal commitment</span>
              <span>01 / JV</span>
            </div>
            <div className="letter-monogram" aria-hidden="true">
              J<span>V</span>
              <i>.</i>
            </div>
            <div className="letter-body">
              <span className="eyebrow">One solicitor. Throughout.</span>
              <p>
                When you instruct me,
                <br />
                you deal with <em>me.</em>
              </p>
              <div className="letter-rule" />
              <span className="letter-name">John Violaris</span>
              <span className="letter-role">
                Criminal Defence & Motoring Solicitor
              </span>
            </div>
            <Link href="/about" className="letter-footer">
              Meet your solicitor <Icon name="arrowRight" size={18} />
            </Link>
          </aside>
        </div>
        <div className="hero-bottom">
          <a href="#expertise" className="explore-link">
            Explore how I can help <span aria-hidden="true">↓</span>
          </a>
          <span>Personal representation. Serious experience.</span>
        </div>
      </Container>
      <div className="experience-band">
        <Container>
          <dl className="experience-grid">
            <div>
              <dd>
                20<span>+</span>
              </dd>
              <dt>Years in criminal defence</dt>
            </div>
            <div>
              <dd>
                10,000<span>+</span>
              </dd>
              <dt>Police station attendances</dt>
            </div>
            <div>
              <dd>2005</dd>
              <dt>Qualified as a solicitor</dt>
            </div>
            <div className="experience-personal">
              <dd>You + John</dd>
              <dt>Direct contact, from the start</dt>
            </div>
          </dl>
        </Container>
      </div>
    </section>
  );
}
