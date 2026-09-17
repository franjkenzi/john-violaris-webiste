"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

/**
 * John's firm on ReviewSolicitors. Every widget is keyed to it, so the id lives
 * here once rather than being repeated at each embed site.
 */
const FIRM_ID = 34897;

const WIDGET_SRC = "https://www.reviewsolicitors.co.uk/widget/rs.js";

/**
 * `side` is the tab pinned to the right edge of the viewport that opens the
 * reviews overlay. `full-page` is the whole review listing, rendered in an
 * iframe that sizes itself to its container.
 */
type WidgetName = "side" | "full-page";

type ReviewSolicitors = {
  loadWidget: (
    elementId: string,
    widgetName: WidgetName,
    firmId: number,
    props: Record<string, unknown>,
  ) => void;
};

declare global {
  interface Window {
    rs?: ReviewSolicitors;
  }
}

/**
 * A ReviewSolicitors widget — verified reviews, served from their platform.
 *
 * Their embed code is a `<script src>` followed by an inline script that calls
 * `rs.loadWidget` once the first has run. Neither survives React, so the loader
 * is `next/script` and the call is made from its callbacks instead.
 *
 * Both `onLoad` and `onReady` are wired up, because which one fires depends on
 * how the visitor arrived. `next/script` keys its load cache on `id`: the first
 * widget to mount gets `onReady` once the fetch finishes, while a second widget
 * sharing the same `src` under a different id is handed the in-flight promise
 * and receives only `onLoad`. Navigate away and back, and the script is already
 * cached, so `onReady` fires on mount. `mounted` makes the call idempotent, so
 * the overlap costs nothing.
 *
 * `elementId` must be stable and unique on the page: `loadWidget` looks the
 * container up by id and names the iframe after it.
 */
export function ReviewSolicitorsWidget({
  widget,
  elementId,
  strategy = "lazyOnload",
  className,
}: {
  widget: WidgetName;
  elementId: string;
  /** `afterInteractive` where the reviews are the point of the page. */
  strategy?: "afterInteractive" | "lazyOnload";
  className?: string;
}) {
  const mounted = useRef(false);

  const load = useCallback(() => {
    if (mounted.current || !window.rs) return;
    if (!document.getElementById(elementId)) return;
    mounted.current = true;
    window.rs.loadWidget(elementId, widget, FIRM_ID, {});
  }, [elementId, widget]);

  return (
    <>
      {/*
        The widget writes its own markup into this element. React renders no
        children here, so it has nothing to reconcile and leaves that DOM alone.
      */}
      <div id={elementId} className={className} style={{ position: "relative" }} />
      <Script
        id={`reviewsolicitors-${widget}`}
        src={WIDGET_SRC}
        strategy={strategy}
        onLoad={load}
        onReady={load}
      />
    </>
  );
}
