import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="wordmark"
      aria-label={`${siteConfig.name} — home`}
    >
      <span>
        John Violaris
      </span>
      {!compact && <small>Criminal Defence Solicitor</small>}
    </Link>
  );
}
