"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { OffenceStrip } from "@/components/sections/offence-strip";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

export function Hero() {
  const scrollStageRef = useRef<HTMLDivElement>(null);
  const mobileScrollStageRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: scrollStageRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: mobileScrollYProgress } = useScroll({
    target: mobileScrollStageRef,
    offset: ["start start", "end 65%"],
  });
  const commitmentCardY = useTransform(
    scrollYProgress,
    [0.08, 0.82],
    ["100%", "0%"],
  );
  const commitmentCardRotate = useTransform(
    scrollYProgress,
    [0.08, 0.82],
    [1.1, 0],
  );
  const mobileCommitmentCardY = useTransform(
    mobileScrollYProgress,
    [0.08, 0.82],
    ["100%", "0%"],
  );
  const mobileCommitmentCardRotate = useTransform(
    mobileScrollYProgress,
    [0.08, 0.82],
    [1.1, 0],
  );
  const firstPortraitScale = useTransform(
    scrollYProgress,
    [0, 0.82],
    [1, 1.035],
  );
  const mobilePortraitScale = useTransform(
    mobileScrollYProgress,
    [0, 0.82],
    [1, 1.035],
  );

  const activeCardY = isMobile ? mobileCommitmentCardY : commitmentCardY;
  const activeCardRotate = isMobile
    ? mobileCommitmentCardRotate
    : commitmentCardRotate;
  const activePortraitScale = isMobile
    ? mobilePortraitScale
    : firstPortraitScale;

  return (
    <section className="hero-editorial" aria-labelledby="hero-heading">
      <Container>
        <div className="hero-topline">
          <span>Independent criminal defence</span>
          <span>England & Wales</span>
        </div>
        <div ref={scrollStageRef} className="hero-scroll-stage">
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
            <div ref={mobileScrollStageRef} className="hero-profile-stage">
              <div className="hero-profile">
                <figure className="hero-portrait">
                  <motion.div
                    className="hero-photo-layer hero-photo-primary"
                    style={{
                      scale: prefersReducedMotion ? 1 : activePortraitScale,
                    }}
                  >
                    <Image
                      src="/John Violaris 1.JPG"
                      alt="John Violaris in court attire outdoors"
                      fill
                      preload
                      sizes="(max-width: 639px) calc(100vw - 62px), (max-width: 1023px) 34vw, 28vw"
                      className="hero-portrait-image hero-portrait-image-primary"
                    />
                    <figcaption className="portrait-caption">
                      <span>John Violaris</span>
                      <small>Criminal Defence Solicitor</small>
                    </figcaption>
                  </motion.div>
                  <motion.aside
                    className="hero-scroll-card"
                    aria-label="John’s personal commitment"
                    style={{
                      y: prefersReducedMotion ? "0%" : activeCardY,
                      rotate: prefersReducedMotion ? 0 : activeCardRotate,
                    }}
                  >
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
                  </motion.aside>
                </figure>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#expertise" className="explore-link">
            Explore how I can help <span aria-hidden="true">↓</span>
          </a>
          <span>Personal representation. Serious experience.</span>
        </div>
      </Container>
      <OffenceStrip />
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
