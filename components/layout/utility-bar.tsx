import Link from "next/link";

import { Icon } from "@/components/ui/icons";
import {
  mailtoHref,
  siteConfig,
  telHref,
  whatsappHref,
} from "@/lib/site-config";

/**
 * Slim contact rail above the masthead.
 *
 * Every reference firm surfaces a way to make contact before the visitor has
 * scrolled anywhere — a phone number in the masthead, a hours/response block,
 * a persistent chat tab. This is that idea in the site's own register: the
 * consultation promise on the left, live contact routes on the right.
 *
 * Only routes that are actually configured are rendered. A number that has not
 * been confirmed yet is simply absent rather than shown as a dead placeholder;
 * email always works, so the bar never renders empty.
 */
export function UtilityBar() {
  const { contact } = siteConfig;
  const whatsapp = whatsappHref();

  return (
    <div className="utility-bar">
      <div className="utility-bar-inner">
        <p className="utility-promise">
          <span className="utility-dot" aria-hidden="true" />
          Free initial consultation
          <span className="utility-response">
            <span aria-hidden="true">·</span> {contact.responseTime}
          </span>
        </p>

        <div className="utility-actions">
          {contact.phoneE164 ? (
            <a href={telHref}>
              <Icon name="call" size={13} />
              {contact.phoneDisplay}
            </a>
          ) : (
            <Link href="/contact#urgent">
              <Icon name="call" size={13} />
              Urgent hearing or interview?
            </Link>
          )}
          <a href={mailtoHref} className="utility-email">
            <Icon name="mail" size={13} />
            {contact.email}
          </a>
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={13} />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
