"use client";

import { isStaleBundleError } from "@/lib/app-version";

/**
 * Last-resort boundary: it replaces the root layout, so it is what a visitor
 * sees when the failure is bad enough that nothing else rendered.
 *
 * Styled inline rather than with Tailwind classes on purpose. This document is
 * rendered without the app's global stylesheet, and the failure it most often
 * reports is a stale tab unable to fetch the deployment's assets — the moment
 * least able to rely on a stylesheet arriving. The brand values here are the
 * literals from `app/globals.css`.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const stale = isStaleBundleError(error);

  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          backgroundColor: "#0d1b2a",
          color: "#fafaf8",
          fontFamily:
            'var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <title>
          {stale ? "Please refresh — John Violaris" : "Error — John Violaris"}
        </title>
        <main style={{ width: "100%", maxWidth: "34rem" }}>
          <p
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#c9a84c",
            }}
          >
            <span
              style={{
                display: "block",
                width: "1.75rem",
                height: "1px",
                background: "#c9a84c",
              }}
            />
            {stale ? "Site updated" : "Something went wrong"}
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontFamily:
                'var(--font-playfair), Georgia, "Times New Roman", serif',
              fontSize: "2rem",
              lineHeight: 1.2,
              fontWeight: 700,
            }}
          >
            {stale
              ? "This page needs refreshing."
              : "This page didn\u2019t load."}
          </h1>
          <p
            style={{
              margin: "1rem 0 0",
              fontSize: "15px",
              lineHeight: 1.75,
              color: "rgba(250, 250, 248, 0.6)",
            }}
          >
            {stale
              ? "The site was updated while this page was open, so it was still using the previous version. Refreshing loads the current one."
              : "Something failed on our side rather than yours. Refreshing often clears it."}
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: "none",
                borderRadius: "3px",
                background: "#c9a84c",
                color: "#0d1b2a",
                padding: "0.875rem 1.75rem",
                font: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Refresh the page
            </button>
            {!stale && (
              <button
                type="button"
                onClick={() => retry()}
                style={{
                  border: "1px solid rgba(250, 250, 248, 0.3)",
                  borderRadius: "3px",
                  background: "transparent",
                  color: "#fafaf8",
                  padding: "0.875rem 1.75rem",
                  font: "inherit",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
