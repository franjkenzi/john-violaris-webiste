import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * A stable identifier for the build being produced.
 *
 * Resolved once, at build time, and inlined into both the browser and the
 * server bundles by the `env` block below, so every copy of a deployment
 * agrees on it. `/api/version` reports the server's copy; `VersionGuard`
 * compares it with the copy baked into the page the visitor is holding.
 *
 * A host's own deployment identifier is preferred, with the commit SHA as the
 * fallback for a self-hosted build from a checkout. When neither is available
 * the value is `"dev"`, which switches the check off rather than guessing: an
 * identifier that differed between the build and the running server would tell
 * every visitor to refresh, permanently.
 */
function resolveAppVersion(): string {
  const declared =
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_SHA;

  if (declared) {
    return declared;
  }

  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

const appVersion = resolveAppVersion();

/**
 * The Supabase storage host, so `next/image` will serve article images.
 *
 * Derived from the configured project URL rather than written out: the host
 * carries the project reference, and a hardcoded one silently stops matching
 * the day the project is restored, branched or moved. If the URL is unset there
 * is no pattern, which is correct — nothing can be uploaded either.
 */
function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) return [];

  try {
    return [
      {
        protocol: "https" as const,
        hostname: new URL(url).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePattern(),
  },

  /**
   * Next's own version-skew protection. Static assets gain a `?dpl=` parameter,
   * client navigations carry the identifier, and a mismatch is resolved with a
   * hard navigation rather than a broken client-side one. It handles the
   * machinery; `VersionGuard` handles telling the visitor what happened.
   *
   * Left unset outside a real build — `next dev` has no deployment, and there
   * is nothing to protect against when the bundles are rebuilt in place.
   */
  deploymentId:
    process.env.NODE_ENV === "production" && appVersion !== "dev"
      ? appVersion
      : undefined,

  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
};

export default nextConfig;
