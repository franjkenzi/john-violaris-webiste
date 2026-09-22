/*
 * Remove the three settings that turned out not to be settings.
 *
 * `20260917111415_seed_cms_content.sql` seeded `site_settings` with everything
 * in `lib/site-config.ts`, including the canonical domain, the secondary domain
 * and the dialling code. Building the Site Settings screen settled that those
 * three are deployment configuration rather than content:
 *
 *  - `url` decides `metadataBase` and every canonical URL on the site. Changing
 *    it from a browser would silently detach every canonical from the domain
 *    actually serving the page.
 *  - `secondaryUrl` is the domain that 301s to the primary one, which is a DNS
 *    and hosting decision.
 *  - `countryCode` is what a national-format telephone number is normalised
 *    against, and it only changes if the practice leaves England & Wales.
 *
 * `getSiteConfig` now reads by `siteSettingKeys` and ignores anything else, so
 * these rows already do nothing. They are deleted rather than left because a
 * row that looks authoritative and is ignored is worse than no row: the next
 * person to find `url` in this table will reasonably assume editing it works.
 *
 * Nothing on the site changes. The values live in `deployment` in
 * `lib/site-config.ts`, which is where they were being read from all along.
 */

delete from public.site_settings
where key in ('url', 'secondaryUrl', 'countryCode');
