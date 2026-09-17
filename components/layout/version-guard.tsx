"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Icon } from "@/components/ui/icons";
import {
  APP_VERSION,
  VERSION_ENDPOINT,
  versionCheckEnabled,
} from "@/lib/app-version";

/** How often to ask the server which build it is serving. */
const POLL_INTERVAL_MS = 5 * 60_000;

/**
 * Floor between checks. Returning to a tab fires several events at once, and a
 * visitor switching windows should not become a stream of requests.
 */
const MIN_CHECK_GAP_MS = 60_000;

/**
 * Watches for the site being redeployed underneath an open tab and asks the
 * visitor to refresh.
 *
 * Deliberately not an automatic reload. Someone on this site is often part-way
 * through describing a charge in the enquiry form, and silently replacing the
 * page would throw that away — the same reason the notice can be dismissed and
 * the old build carried on with. Next's `deploymentId` already keeps navigation
 * itself working across a deploy; this is the part that speaks to the person.
 */
export function VersionGuard() {
  const [stale, setStale] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const lastCheckedAt = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (!versionCheckEnabled || stale) {
      return;
    }

    let cancelled = false;

    const check = async () => {
      // A background tab is nobody's problem until it is looked at again.
      if (document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (now - lastCheckedAt.current < MIN_CHECK_GAP_MS) {
        return;
      }
      lastCheckedAt.current = now;

      try {
        const response = await fetch(VERSION_ENDPOINT, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload: unknown = await response.json();
        const version =
          typeof payload === "object" && payload !== null
            ? (payload as { version?: unknown }).version
            : undefined;

        if (!cancelled && typeof version === "string" && version !== APP_VERSION) {
          setStale(true);
        }
      } catch {
        /*
          Offline, or the server is briefly unreachable mid-deploy. A check that
          failed is not evidence of a new version, so it passes in silence and
          the next one decides.
        */
      }
    };

    const interval = window.setInterval(check, POLL_INTERVAL_MS);
    // Returning to the tab is the moment a stale build is about to be used.
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    window.addEventListener("online", check);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
    };
  }, [stale]);

  const open = versionCheckEnabled && stale && !dismissed;

  // Hold focus inside the notice while it is open, and lock the page behind it.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDismissed(true);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable =
        panelRef.current.querySelectorAll<HTMLButtonElement>("button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-navy-deep/85 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div
        ref={panelRef}
        className="navy-field w-full max-w-lg rounded-card border border-gold/25 p-7 shadow-2xl shadow-black/60 sm:p-10"
      >
        <p className="section-label">Site updated</p>
        <h2
          id={headingId}
          className="mt-4 font-display text-[26px] leading-[1.25] font-bold text-cream sm:text-3xl"
        >
          A newer version of this site is available.
        </h2>
        <p className="mt-4 text-[15px] leading-[1.75] text-cream/65">
          This page was opened before the site was last updated, so parts of it
          may not work as expected. Refreshing loads the current version and
          takes a moment.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center justify-center gap-2 rounded-sharp bg-gold px-7 py-3.5 text-[13px] font-bold tracking-[0.07em] text-navy uppercase transition-colors duration-150 hover:bg-gold-light"
          >
            <Icon name="refresh" size={15} />
            Refresh the page
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex items-center justify-center rounded-sharp border border-cream/30 px-7 py-3.5 text-[13px] font-bold tracking-[0.07em] text-cream uppercase transition-colors duration-150 hover:border-gold hover:text-gold-light"
          >
            Not now
          </button>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-cream/45">
          Choosing &ldquo;not now&rdquo; keeps anything you have already typed.
          Refresh once you have finished.
        </p>
      </div>
    </div>
  );
}
