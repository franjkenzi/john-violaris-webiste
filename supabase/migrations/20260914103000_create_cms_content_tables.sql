/*
 * CMS content tables — initial structure (PRD §28).
 *
 * Deliberately minimal. Each table carries only the columns needed to identify,
 * order and publish a row; everything else lives in a `content` jsonb column.
 * That means the exact field list can be settled while building the admin UI in
 * Phase 2 WITHOUT writing another migration for every field added.
 *
 * Follows the conventions set by `20260913183223_create_profiles.sql`:
 * RLS on, all privileges revoked, then explicit grants and policies.
 *
 * Read model: anon and authenticated may read published rows only.
 * Write model: admins only, via `private.is_admin()`.
 */

-- Admin predicate used by every write policy below. Security definer so the
-- policy can read `profiles` regardless of the caller's own RLS.
create function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

-- Shared `updated_at` maintenance.
create function private.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Key/value so new settings need no schema change.
-- NOTE: publicly readable. Never store secrets here.
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- The service catalogue (nav, cards, offence rail).
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  published boolean not null default false,
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Long-form body of an individual offence page; one per service.
create table public.service_pages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null unique references public.services (id) on delete cascade,
  published boolean not null default false,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `price` is text, not numeric: real entries read "From £X" or "On enquiry".
create table public.fees (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price text,
  published boolean not null default false,
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  quote text not null,
  rating smallint,
  published boolean not null default false,
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_rating_check check (rating is null or rating between 1 and 5)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_id uuid references public.blog_categories (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-route SEO overrides, keyed by site path e.g. '/services/drink-driving'.
create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- Indexes for the lookups the public site actually performs
-- ---------------------------------------------------------------------------

create index services_published_order_idx
  on public.services (published, sort_order);
create index fees_published_order_idx
  on public.fees (published, sort_order);
create index testimonials_published_order_idx
  on public.testimonials (published, sort_order);
create index blog_posts_published_date_idx
  on public.blog_posts (published, published_at desc);
create index blog_posts_category_idx
  on public.blog_posts (category_id);


-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function private.touch_updated_at();
create trigger services_touch_updated_at
  before update on public.services
  for each row execute function private.touch_updated_at();
create trigger service_pages_touch_updated_at
  before update on public.service_pages
  for each row execute function private.touch_updated_at();
create trigger fees_touch_updated_at
  before update on public.fees
  for each row execute function private.touch_updated_at();
create trigger testimonials_touch_updated_at
  before update on public.testimonials
  for each row execute function private.touch_updated_at();
create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function private.touch_updated_at();
create trigger seo_metadata_touch_updated_at
  before update on public.seo_metadata
  for each row execute function private.touch_updated_at();


-- ---------------------------------------------------------------------------
-- Row level security
--
-- Every table: RLS on, all privileges revoked, then read granted to visitors
-- and write granted to `authenticated` but gated to admins by policy.
-- ---------------------------------------------------------------------------

alter table public.site_settings enable row level security;
alter table public.blog_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_pages enable row level security;
alter table public.fees enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;
alter table public.seo_metadata enable row level security;

revoke all on table
  public.site_settings, public.blog_categories, public.services,
  public.service_pages, public.fees, public.testimonials,
  public.blog_posts, public.seo_metadata
from public, anon, authenticated;

grant select on table
  public.site_settings, public.blog_categories, public.services,
  public.service_pages, public.fees, public.testimonials,
  public.blog_posts, public.seo_metadata
to anon, authenticated;

grant insert, update, delete on table
  public.site_settings, public.blog_categories, public.services,
  public.service_pages, public.fees, public.testimonials,
  public.blog_posts, public.seo_metadata
to authenticated;

grant select, insert, update, delete on table
  public.site_settings, public.blog_categories, public.services,
  public.service_pages, public.fees, public.testimonials,
  public.blog_posts, public.seo_metadata
to service_role;


-- Config and lookup tables: readable by anyone, no publish flag.
create policy "Anyone can read site settings"
on public.site_settings for select to anon, authenticated using (true);

create policy "Anyone can read blog categories"
on public.blog_categories for select to anon, authenticated using (true);

create policy "Anyone can read seo metadata"
on public.seo_metadata for select to anon, authenticated using (true);


-- Content tables: only published rows are visible to the public.
create policy "Anyone can read published services"
on public.services for select to anon, authenticated using (published);

create policy "Anyone can read published service pages"
on public.service_pages for select to anon, authenticated using (published);

create policy "Anyone can read published fees"
on public.fees for select to anon, authenticated using (published);

create policy "Anyone can read published testimonials"
on public.testimonials for select to anon, authenticated using (published);

create policy "Anyone can read published blog posts"
on public.blog_posts for select to anon, authenticated using (published);


-- Admins may do anything, including reading unpublished drafts.
create policy "Admins can manage site settings"
on public.site_settings for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage blog categories"
on public.blog_categories for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage services"
on public.services for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage service pages"
on public.service_pages for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage fees"
on public.fees for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage testimonials"
on public.testimonials for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage blog posts"
on public.blog_posts for all to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Admins can manage seo metadata"
on public.seo_metadata for all to authenticated
using (private.is_admin()) with check (private.is_admin());
