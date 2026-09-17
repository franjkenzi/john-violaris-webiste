/**
 * Stale-build detection (see also `next.config.ts` and `VersionGuard`).
 *
 * A visitor who leaves a tab open across a deploy is left holding the previous
 * build: its JavaScript chunks may no longer be served, its prefetched route
 * data no longer matches, and the enquiry form's server action carries an id
 * the new server does not recognise. The failures are quiet and confusing, so
 * the site detects the mismatch and asks for a refresh in plain language.
 */

/**
 * The build this bundle was compiled from. Inlined at build time by the `env`
 * block in `next.config.ts`, which means the browser bundle and the server
 * bundle of a given deployment always carry the same value.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

/** Where the running server reports the build it is currently serving. */
export const VERSION_ENDPOINT = "/api/version";

/**
 * `"dev"` means no deployment identifier was available at build time, so there
 * is nothing meaningful to compare and the check stays out of the way.
 */
export const versionCheckEnabled = APP_VERSION !== "dev";

/**
 * Whether an error carries the signature of a stale bundle: the browser asked
 * for a JavaScript or CSS file that this deployment no longer serves.
 *
 * Next labels its own failures `ChunkLoadError`, but a native `import()` of a
 * missing module surfaces as a plain `TypeError` whose wording differs per
 * engine, so the message is checked as well.
 */
export function isStaleBundleError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const { name, message } = error as { name?: unknown; message?: unknown };

  if (name === "ChunkLoadError") {
    return true;
  }

  return (
    typeof message === "string" &&
    /loading (css )?chunk|dynamically imported module|importing a module script failed|error loading script/i.test(
      message,
    )
  );
}
