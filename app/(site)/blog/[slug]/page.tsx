import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { OnThisPage } from "@/components/ui/on-this-page";
import { Icon } from "@/components/ui/icons";
import { CtaBanner } from "@/components/layout/cta-banner";
import { articles, findArticle } from "@/lib/content/blog";
import { allServices } from "@/lib/content/services";
import { siteConfig } from "@/lib/site-config";
import { slugify } from "@/lib/slug";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const related = allServices.find(
    (service) => service.href === article.relatedService,
  );
  const more = articles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const sections = article.body.map((block) => ({
    id: slugify(block.heading),
    label: block.heading,
  }));

  return (
    <>
      <section className="article-intro">
        <Container>
          <Link href="/blog" className="breadcrumb">
            Home <span>/</span> Useful information
          </Link>
          <p className="eyebrow">
            <span className="small-rule" /> {article.category}
          </p>
          <h1>{article.title}</h1>
          <p className="article-standfirst">{article.standfirst}</p>
          <div className="article-meta">
            <span>{siteConfig.name}</span>
            <span>{siteConfig.role}</span>
            <span>{article.readTime}</span>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="article-layout">
            <div className="article-body">
              {article.body.map((block) => (
                <section key={block.heading}>
                  <h2 id={slugify(block.heading)}>{block.heading}</h2>
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {block.list && (
                    <ul>
                      {block.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/*
                Publishing legal commentary invites people to act on it. Say
                plainly that it is general information, as the reference firms
                do on their own guides.
              */}
              <p className="article-disclaimer">
                This article is general information about the law in England and
                Wales. It is not legal advice and it does not take account of
                your circumstances. If you are facing a charge or an
                investigation, speak to a solicitor about your own case.
              </p>

              {related && (
                <Link href={related.href} className="text-link">
                  Read more about {related.name.toLowerCase()}{" "}
                  <Icon name="arrowRight" size={17} />
                </Link>
              )}
            </div>

            <div className="page-rail">
              <OnThisPage items={sections} />
              <aside className="service-contact-card">
                <span className="eyebrow">Speak directly to John</span>
                <h2>
                  It starts with
                  <br />
                  <em>a conversation.</em>
                </h2>
                <p>
                  A free initial consultation. A chance to explain your
                  situation and understand the next step.
                </p>
                <Link href={siteConfig.bookingUrl} className="action-button">
                  Discuss your case <Icon name="arrowRight" size={17} />
                </Link>
                <span className="service-contact-caption">
                  20+ years in criminal defence
                  <br />
                  Representing clients across England &amp; Wales
                </span>
              </aside>
            </div>
          </div>

          {more.length > 0 && (
            <div className="related-services">
              <p className="eyebrow">More guides</p>
              {more.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`}>
                  {item.title}
                  <Icon name="arrowRight" size={18} />
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <CtaBanner
        heading="Still have questions?"
        emphasis="Let’s talk them through."
      />
    </>
  );
}
