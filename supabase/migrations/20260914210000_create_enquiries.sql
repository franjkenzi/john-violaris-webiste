/*
 * Enquiries — public contact form submissions (PRD §6.8, §7).
 *
 * DEPENDS ON `20260914103000_create_cms_content_tables.sql` for `private.is_admin()`
 * and `private.touch_updated_at()`. Apply that migration first.
 *
 * The security model here is the INVERSE of the CMS content tables, and
 * deliberately stricter than any of them:
 *
 *   CMS tables  — anyone reads published rows, admins write.
 *   Enquiries   — nobody reads but admins, and nobody writes through the API.
 *
 * `anon` gets no grant of any kind, so this table is unreachable through the
 * Data API with the publishable key. Inserts happen server-side only, in the
 * enquiry server action, using the secret key (which bypasses RLS). That keeps
 * validation, the honeypot and the rate limit on the only path into the table
 * rather than on a path a spammer can step around.
 *
 * This matters more here than elsewhere: a row holds a named person's account
 * of a criminal allegation against them. Treat it as sensitive throughout.
 *
 * `ip_hash` exists so submissions can be rate limited without retaining a
 * visitor's IP address. The raw address is hashed with a server-side salt at
 * submission time and never stored.
 */

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),

  -- Fields from the enquiry form, in PRD §6.8 order.
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  matter_type text not null,
  -- Free text, not `date`: visitors write "next Tuesday" or "15 March, I think".
  court_date text,
  court_location text,
  description text not null,

  -- Workflow state for the admin inbox.
  status text not null default 'new',

  -- Delivery record for the two Resend emails, written after the response is
  -- sent. Null `*_at` with a non-null `email_error` means John was never
  -- emailed and the dashboard is the only record of the enquiry.
  admin_notified_at timestamptz,
  visitor_confirmed_at timestamptz,
  email_error text,

  -- Request context. `source_path` is which page the enquiry came from.
  source_path text,
  ip_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint enquiries_status_check
    check (status in ('new', 'read', 'replied', 'archived'))
);

-- Inbox ordering, and the status filter above it.
create index enquiries_created_at_idx
  on public.enquiries (created_at desc);
create index enquiries_status_created_at_idx
  on public.enquiries (status, created_at desc);

-- Supports the rate-limit lookup: recent submissions from one hashed address.
create index enquiries_ip_hash_created_at_idx
  on public.enquiries (ip_hash, created_at desc)
  where ip_hash is not null;

create trigger enquiries_touch_updated_at
  before update on public.enquiries
  for each row execute function private.touch_updated_at();


-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.enquiries enable row level security;

revoke all on table public.enquiries from public, anon, authenticated;

-- Note the absence of `insert` for `authenticated`, and of anything at all for
-- `anon`. Submissions arrive through the secret key, which bypasses RLS.
grant select, update, delete on table public.enquiries to authenticated;
grant select, insert, update, delete on table public.enquiries to service_role;

create policy "Admins can read enquiries"
on public.enquiries for select to authenticated
using (private.is_admin());

-- Both clauses: `using` decides which rows may be updated, `with check` stops
-- an update writing a row that would then fail the same test.
create policy "Admins can update enquiries"
on public.enquiries for update to authenticated
using (private.is_admin()) with check (private.is_admin());

-- Deletion is how an erasure request gets honoured, so admins need it.
create policy "Admins can delete enquiries"
on public.enquiries for delete to authenticated
using (private.is_admin());
