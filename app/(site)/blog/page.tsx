import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/pages/page-intro";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { CtaBanner } from "@/components/layout/cta-banner";
import { articles } from "@/lib/content/blog";

/**
 * The blog index lives here rather than in the `[page]` catch-all, so that the
 * static `/blog` segment and `/blog/[slug]` sit in one tree and there is no
 * ambiguity about which route serves `/blog`.
 */
const intro = {
  eyebrow: "Useful information",
  title: "A little clarity.",
  emphasis: "Before we talk.",
  description:
    "Plain-English explanations of motoring law from a practising solicitor with over 20 years of criminal defence experience.",
};

export const metadata: Metadata = {
  title: intro.eyebrow,
  description: intro.description,
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <>
      <PageIntro {...intro} />
      <section className="section-space">
        <Container>
          <div className="article-grid">
            {articles.map((article) => (
              <article key={article.slug} className="article-card">
                <Link href={`/blog/${article.slug}`}>
                  <span className="article-card-category">
                    <Icon name={article.icon} size={15} />
                    {article.category}
                  </span>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <span className="article-card-meta">
                    <span>John Violaris</span>
                    <span>{article.readTime}</span>
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
      {/*
        Carried over from the previous `/blog` page: orientation for readers who
        arrived here without knowing what they are looking for.
      */}
      <section className="section-space">
        <Container>
          <div className="information-grid">
            <article>
              <span className="eyebrow">Getting ready</span>
              <h2>Your first conversation.</h2>
              <p>
                Bring together any documents you have received, note important
                dates and write down the questions you would like to ask. You
                don’t need to understand every legal term before getting in
                touch.
              </p>
              <Link href="/contact" className="text-link">
                Speak to John <Icon name="arrowRight" size={16} />
              </Link>
            </article>
            <article>
              <span className="eyebrow">Finding support</span>
              <h2>What are you facing?</h2>
              <p>
                Explore the areas of practice to find the support that fits your
                situation. If you’re unsure which category applies, explain what
                has happened to John directly.
              </p>
              <Link href="/services" className="text-link">
                Explore services <Icon name="arrowRight" size={16} />
              </Link>
            </article>
            <article>
              <span className="eyebrow">Planning ahead</span>
              <h2>Understanding fees.</h2>
              <p>
                Your first conversation is free. Before instructing John,
                discuss what work is needed, what the fees cover and how any
                further hearings would be handled.
              </p>
              <Link href="/fees" className="text-link">
                Read about fees <Icon name="arrowRight" size={16} />
              </Link>
            </article>
          </div>
        </Container>
      </section>
      <CtaBanner
        heading="Found the answer?"
        emphasis="Now let’s talk about your case."
      />
    </>
  );
}
