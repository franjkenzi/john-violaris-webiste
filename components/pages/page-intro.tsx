import Link from "next/link";
import { Container } from "@/components/ui/container";
export function PageIntro({
  eyebrow,
  title,
  emphasis,
  description,
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <Container>
        <Link href="/" className="breadcrumb">
          Home <span>/</span> {eyebrow}
        </Link>
        <p className="eyebrow">
          <span className="small-rule" /> {eyebrow}
        </p>
        <h1>
          {title}
          <br />
          <em>{emphasis}</em>
        </h1>
        <p className="page-intro-description">{description}</p>
      </Container>
    </section>
  );
}
