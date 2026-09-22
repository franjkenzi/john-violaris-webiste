import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { Lines, Paragraphs } from "@/components/ui/lines";
import { meetJohnDefaults } from "@/lib/content/pages";
import type { MeetJohnContent } from "@/lib/content/pages";

/**
 * John's personal introduction. The home page and the about page render the
 * same copy from here, so the two stay in step by construction. The one
 * difference is `showAboutLink`: on /about the link would point at the page
 * already being read.
 */
export function MeetJohn({
  showAboutLink = true,
  content = meetJohnDefaults,
}: {
  showAboutLink?: boolean;
  content?: MeetJohnContent;
}) {
  return (
    <section
      id="john"
      className="personal-section section-space"
      aria-labelledby="meet-john-heading"
    >
      <Container>
        <div className="personal-grid">
          <div className="personal-heading">
            <p className="eyebrow">
              <span className="small-rule" /> {content.eyebrow}
            </p>
            <h2 id="meet-john-heading" className="display-heading">
              <Lines values={content.headline} />
              <br />
              <em>
                <Lines values={content.headlineEmphasis} />
              </em>
            </h2>
            <p className="personal-aside">
              <Lines values={content.aside} />
            </p>
            <span className="personal-signoff">
              {content.signoff}
              <span>.</span>
            </span>
            {showAboutLink && (
              <Link className="text-link" href="/about">
                {content.aboutLinkLabel} <Icon name="arrowRight" size={17} />
              </Link>
            )}
          </div>
          <div className="personal-story">
            <p className="story-lead">
              <Lines values={content.storyLead} />
            </p>
            <Paragraphs values={content.story} />
            <div className="personal-promises">
              {content.promises.map((promise) => (
                <div key={promise.title}>
                  <Icon name={promise.icon} size={18} />
                  <h3>{promise.title}</h3>
                  <p>{promise.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
