import { APP_VERSION } from "@/lib/app-version";

/**
 * Reports the build this server is serving, for `VersionGuard` to compare
 * against the build the visitor's tab was loaded from.
 *
 * Forced dynamic and explicitly uncacheable: a response cached by a CDN or by
 * the browser would keep reporting the previous deployment, which is the exact
 * failure this endpoint exists to detect.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: APP_VERSION },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
