"use client";

import { useEffect, useState } from "react";

export type TocItem = {
  /** Must match the `id` on the heading it points at. */
  id: string;
  label: string;
};

/**
 * Distance from the top of the viewport that counts as "being read". Sits just
 * below the sticky header, matching `scroll-padding-top` on `html`.
 */
const READING_LINE = 140;

/** The last heading scrolled past, or the first one while still above it. */
function pickActive(ids: string[]): string | null {
  let current: string | null = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (current === null) current = id;
    if (el.getBoundingClientRect().top <= READING_LINE) current = id;
  }
  return current;
}

/**
 * Scroll-spy contents rail for the long service and article pages.
 *
 * The links are ordinary anchors, so they work before hydration and without
 * JavaScript — `scroll-padding-top` on `html` keeps the target clear of the
 * sticky header. The highlight is layered on top of that.
 *
 * Position is read from geometry rather than an IntersectionObserver: with
 * headings of very different lengths the "which one am I reading" question is
 * really about what you have scrolled past, and computing it directly means
 * there is always a sensible answer — including on first paint and when the
 * page loads at an anchor part-way down.
 */
export function OnThisPage({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.map((item) => item.id);
    /*
     * A handful of rect reads per scroll event, with no interleaved writes, so
     * there is nothing here worth throttling — and `passive` keeps it off the
     * scrolling critical path.
     */
    const update = () => setActive(pickActive(ids));

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="toc" aria-labelledby="toc-heading">
      <p className="eyebrow" id="toc-heading">
        On this page
      </p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={active === item.id ? "toc-active" : undefined}
              aria-current={active === item.id ? "true" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
