"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/section-label";
import { isStaleBundleError } from "@/lib/app-version";
/*
 * The static configuration, not the stored one. An error boundary whose
 * branding needs a database read is an error boundary that fails when the
 * database read is what broke.
 */
import { fallbackSiteConfig } from "@/lib/site-config";

/**
 * Route-level error boundary.
 *
 * Its first job is the stale-bundle case: a tab opened before a deploy reaches
 * for a script the current deployment no longer serves, and without this the
 * visitor gets a blank screen. `VersionGuard` catches most of those before they
 * break, but a navigation can outrun the five-minute poll, so the same request
 * — refresh — is repeated here with the reload wired to the primary button.
 *
 * Anything else is a genuine fault, and the honest response is a way back plus
 * the phone number, since the people reading this site are frequently working
 * to a hearing date.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const stale = isStaleBundleError(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[80vh] items-center bg-navy">
      <Container className="py-20 lg:py-24">
        <div className="max-w-xl">
          <SectionLabel>
            {stale ? "Site updated" : "Something went wrong"}
          </SectionLabel>
          <h1 className="mt-4 font-display text-4xl font-bold text-cream">
            {stale
              ? "This page needs refreshing."
              : "This page didn\u2019t load."}
          </h1>
          <p className="mt-4 text-[15px] leading-[1.75] text-cream/60">
            {stale
              ? "The site was updated while this page was open, so it was still using the previous version. Refreshing loads the current one."
              : "Something failed on our side rather than yours. Trying again often clears it. If your matter is urgent \u2014 a court hearing tomorrow or a police interview today \u2014 please call rather than wait."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={stale ? () => window.location.reload() : retry}
              className="inline-flex items-center justify-center gap-2 rounded-sharp bg-gold px-7 py-3.5 text-[13px] font-bold tracking-[0.07em] text-navy uppercase transition-colors duration-150 hover:bg-gold-light"
            >
              <Icon name="refresh" size={15} />
              {stale ? "Refresh the page" : "Try again"}
            </button>
            <ButtonLink
              href={stale ? "/" : fallbackSiteConfig.telHref}
              variant="outline"
              size="lg"
            >
              {stale ? (
                "Back to home"
              ) : (
                <>
                  <Icon name="call" size={15} />
                  {fallbackSiteConfig.phoneE164
                    ? `Call ${fallbackSiteConfig.phoneDisplay}`
                    : "Urgent? Contact John"}
                </>
              )}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
