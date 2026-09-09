import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/section-label";
import { valueCards } from "@/lib/content/home";

export function WhyInstruct() {
  return (
    <section className="bg-cream" aria-labelledby="why-instruct-heading">
      <Container className="py-16 lg:py-20">
        <div className="max-w-2xl">
          <SectionLabel>Why instruct me</SectionLabel>
          <h2
            id="why-instruct-heading"
            className="mt-5 font-display text-[32px] leading-[1.14] font-bold text-ink sm:text-[38px]"
          >
            You hire a solicitor.
            <br />
            <em className="text-gold-ink italic">You should get one.</em>
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-body">
            Large firms sell you a brand and hand you to whoever is free that
            morning. This is a one-solicitor practice, deliberately.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {valueCards.map((card, index) => (
            <li
              key={card.title}
              className="flex gap-5 border-t border-line pt-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-navy text-gold">
                <Icon name={card.icon} size={22} />
              </span>
              <div>
                <p className="flex items-center gap-2.5 font-display text-[13px] font-bold tracking-[0.14em] text-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                  <span aria-hidden="true" className="h-px w-6 bg-gold/50" />
                </p>
                <h3 className="mt-1.5 font-display text-[19px] font-bold text-ink">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-body">
                  {card.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
