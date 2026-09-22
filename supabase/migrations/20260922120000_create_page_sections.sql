/*
 * Editable page copy (Phase 2 — "Website content management").
 *
 * The other content tables each hold a *kind of thing*: a service, a fee, an
 * article. This one holds the editorial copy that is part of a page rather than
 * a thing in its own right — the hero, the section headings, the standfirsts,
 * the four process steps. One row per (page, section).
 *
 * Follows the conventions in `20260914103000_create_cms_content_tables.sql`:
 * RLS on, all privileges revoked, then explicit grants and policies, and
 * everything the page renders in a `content` jsonb column so the field list can
 * change without another migration.
 *
 * Two differences from the tables alongside it, both deliberate:
 *
 *  1. No `published` column. Unpublishing a hero does not mean anything — the
 *     page still has to render one — so the choice is between the edited copy
 *     and the copy written in `lib/content/pages.ts`, not between shown and
 *     hidden. The read layer makes that choice by row presence.
 *
 *  2. No seed. A section that has never been edited simply has no row, and
 *     `getPageContent` falls back to the static default. That keeps the
 *     defaults the single definition of what a section says out of the box,
 *     and means this table starts empty and stays that way until John edits
 *     something. Nothing here can drift from the code it came from because
 *     nothing here is a copy of it.
 */

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  -- Which page's group the section belongs to, e.g. 'home', 'fees'. Matches a
  -- group key in `lib/cms/sections/schema.ts`, not necessarily a route: a few
  -- sections render on more than one page.
  page text not null,
  -- The section within that group, e.g. 'hero', 'process'.
  section text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_sections_page_section_key unique (page, section)
);

-- Every read is "all sections for one page", which is what the unique
-- constraint's index already leads with. No second index earns its keep.

create trigger page_sections_touch_updated_at
  before update on public.page_sections
  for each row execute function private.touch_updated_at();


-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.page_sections enable row level security;

revoke all on table public.page_sections from public, anon, authenticated;

grant select on table public.page_sections to anon, authenticated;
grant insert, update, delete on table public.page_sections to authenticated;
grant select, insert, update, delete on table public.page_sections to service_role;

-- Readable by anyone: this is the copy on the public pages, and there is no
-- draft state to protect.
create policy "Anyone can read page sections"
on public.page_sections for select to anon, authenticated using (true);

create policy "Admins can manage page sections"
on public.page_sections for all to authenticated
using (private.is_admin()) with check (private.is_admin());
