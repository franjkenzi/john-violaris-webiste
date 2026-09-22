import Link from "next/link";

import { siteSettingsDefaults } from "@/lib/site-config";

/**
 * The wordmark.
 *
 * Takes the name and role as props rather than reading the configuration
 * itself, because it is rendered from both sides: the masthead is a Client
 * Component and the footer is a Server Component, and neither the hook nor the
 * async read works in both. The defaults keep it rendering for a caller that
 * passes neither.
 */
export function Logo({
  compact = false,
  name = siteSettingsDefaults.name,
  role = siteSettingsDefaults.role,
}: {
  compact?: boolean;
  name?: string;
  role?: string;
}) {
  return (
    <Link href="/" className="wordmark" aria-label={`${name} — home`}>
      <span>{name}</span>
      {!compact && <small>{role}</small>}
    </Link>
  );
}
