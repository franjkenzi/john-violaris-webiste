-- Renames three services, moves speeding into the driving standards group, and
-- renumbers that group so the rows still sort into the order the catalogue
-- renders.
--
-- The seed migration carries all of this for a fresh database, but it is
-- guarded by `where not exists`, so a database that has already been seeded
-- keeps the old names and the old grouping. This migration patches those rows
-- in place.
--
-- `sort_order` is rewritten for every row in the driving standards group rather
-- than only for speeding: `toServiceGroups` rebuilds the menu from row order
-- alone, so the numbers here have to match the ones the seed generator emits or
-- a seeded database and a fresh one would render the group differently.
--
-- `content || patch` merges into the existing JSON rather than replacing it, so
-- anything else stored against a service (icon, statute, featured flag, intro)
-- survives untouched.

update public.services as s
set name = v.name,
    sort_order = v.sort_order,
    content = s.content || v.patch,
    updated_at = now()
from (values
    ('speeding'::text, 'Speeding'::text, 200::integer, '{"group":"Driving standards"}'::jsonb),
    ('careless-driving'::text, 'Careless Driving'::text, 201::integer, '{}'::jsonb),
    ('dangerous-driving'::text, 'Dangerous Driving'::text, 202::integer, '{}'::jsonb),
    ('mobile-phone'::text, 'Using Mobile Phone'::text, 203::integer, '{}'::jsonb),
    ('driver-details'::text, 'Failing to Provide Driver Details'::text, 302::integer, '{}'::jsonb),
    ('criminal-defence'::text, 'Magistrates Court'::text, 401::integer, '{"statute":"Criminal defence"}'::jsonb)
  ) as v (slug, name, sort_order, patch)
where s.slug = v.slug;

-- "General Criminal Defence" was too long for the compact rail and carried a
-- shorter label. "Magistrates Court" is not, so the key goes rather than
-- sitting there holding the old name.
update public.services
set content = content - 'short',
    updated_at = now()
where slug = 'criminal-defence'
  and content ? 'short';

-- The group rename again, in case a service was added to the old heading after
-- `20260917140000_update_service_card_copy.sql` ran. Both casings, because the
-- heading has been written each way.
update public.services
set content = jsonb_set(content, '{group}', '"Drugs & Alcohol"'::jsonb),
    updated_at = now()
where content ->> 'group' in ('Alcohol & drugs', 'Alcohol & Drugs', 'Alcohol and drugs');
