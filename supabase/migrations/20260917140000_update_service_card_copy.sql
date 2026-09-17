-- Rewrites the service card copy shown in the offence explorer on the home page.
--
-- The seed migration carries this text for a fresh database, but it is guarded
-- by `where not exists`, so a database that has already been seeded keeps the
-- old wording. This migration patches those rows in place.
--
-- Only the three keys that changed are touched — `content || patch` merges into
-- the existing JSON rather than replacing it, so anything else stored against a
-- service (statute, short name, featured flag) survives untouched.

update public.services as s
set content = s.content || v.patch,
    updated_at = now()
from (values
    ('drink-driving'::text, '{"group":"Drugs & Alcohol","intro":"Understand what your reading means and receive clear advice on your options."}'::jsonb),
    ('drug-driving'::text, '{"group":"Drugs & Alcohol","icon":"leaf","intro":"Understand the allegation, the test results and how to counter them."}'::jsonb),
    ('failing-to-provide'::text, '{"group":"Drugs & Alcohol","intro":"Did you have a reasonable excuse? Receive advice on how to defend FTP cases."}'::jsonb),
    ('drunk-in-charge'::text, '{"group":"Drugs & Alcohol","intro":"Sleeping in your car? Zero likelihood of driving? Find out how to defend this allegation."}'::jsonb),
    ('totting-up'::text, '{"intro":"Facing a 6-month ban? Find out how this can be avoided."}'::jsonb),
    ('exceptional-hardship'::text, '{"intro":"12 points need not mean a driving ban. Find out whether your case meets the threshold."}'::jsonb),
    ('special-reasons'::text, '{"intro":"There may be special circumstances that enable you to avoid a ban. Find out more!"}'::jsonb),
    ('speeding'::text, '{"intro":"Trigger-happy cameras or shoddy sign posting make these cases defensible. Find out more!"}'::jsonb),
    ('careless-driving'::text, '{"intro":"Did your driving really fall below the expected standard given the circumstances? Find out if you have a defence."}'::jsonb),
    ('dangerous-driving'::text, '{"intro":"Did the police exaggerate? Were you careless rather than dangerous? Serious allegations need not put your future in question."}'::jsonb),
    ('mobile-phone'::text, '{"intro":"Was it really in use? Find out how to defend these allegations and to avoid 6 points."}'::jsonb),
    ('no-insurance'::text, '{"intro":"Driving without insurance is a strict liability offence, but were you misled into believing that you were insured? Find out more."}'::jsonb)
  ) as v (slug, patch)
where s.slug = v.slug;

-- Any service added to the old group after the seed ran, so the rename is
-- complete whatever else is in the table.
update public.services
set content = jsonb_set(content, '{group}', '"Drugs & Alcohol"'::jsonb),
    updated_at = now()
where content ->> 'group' = 'Alcohol & drugs';
