-- Splits Magistrates Court onto its own service and page, and renames the two
-- general crime cards in the Representation group.
--
-- "Magistrates Court" was the label on `criminal-defence`, which is the general
-- criminal defence page rather than a page about the court. That card goes back
-- to being the general crime one, under the name "All Crime", and a real
-- Magistrates Court service is inserted alongside it. `criminal-defence` keeps
-- its slug: it is a live URL and a card rename is not a reason to break it.
--
-- The group ends up four wide: Police Station (400), Magistrates Court (401),
-- All Crime (402), Non-Motoring Crime (403). `toServiceGroups` rebuilds the
-- menu from row order alone, so those numbers have to match the ones the seed
-- generator emits, which is why the two existing rows are renumbered before the
-- new one is inserted.
--
-- The card copy rewritten on the home page in the same pass is patched at the
-- bottom. `content || patch` merges, so anything else stored against a service
-- survives untouched.

-- 1. Make room at 401.
update public.services
set sort_order = case slug when 'criminal-defence' then 402 else 403 end,
    updated_at = now()
where slug in ('criminal-defence', 'all-crime');

-- 2. The new service. `where not exists` so a freshly seeded database, which
--    already carries it, is left alone.
insert into public.services (slug, name, published, sort_order, content)
select v.slug, v.name, v.published, v.sort_order, v.content
from (values
    ('magistrates-court'::text, 'Magistrates Court'::text, true, 401::integer, '{"group":"Representation","icon":"scales","statute":"Where most cases are heard","intro":"Expert representation whatever the reason you’re there for."}'::jsonb)
  ) as v (slug, name, published, sort_order, content)
where not exists (
  select 1 from public.services where slug = 'magistrates-court'
);

insert into public.service_pages (service_id, published, content)
select s.id, v.published, v.content
from (values
    ('magistrates-court'::text, true, '{"headline":"The magistrates’ court.","emphasis":"Where most of it happens.","intro":"Whatever has brought you there — a motoring allegation, a first arrest, or something that has been hanging over you for months — the magistrates’ court is where it will be dealt with. John appears in these courts across England and Wales, and the solicitor who reads your papers is the one who stands up on the day.","penalties":[{"label":"Where your case begins","note":"Every criminal case starts here","tone":"note"},{"label":"First hearing to trial","note":"The same solicitor throughout","tone":"note"},{"label":"Sent to the Crown Court?","note":"Allocation is explained before it happens","tone":"note"}],"issuesHeading":"What happens in the magistrates’ court","issuesIntro":"Most people see the inside of a courtroom once. Knowing the shape of the day removes a good deal of what makes it frightening.","defenceIssues":[{"title":"The first hearing","body":"The charge is put and a plea is taken. Little else is decided that day — but you should not arrive without knowing what the evidence against you actually says."},{"title":"Plea, and the credit for it","body":"A guilty plea attracts a reduction in sentence, and the reduction is at its largest at the first hearing. That is a reason to decide early. It is not a reason to decide quickly."},{"title":"Bail and conditions","body":"Where bail is opposed, or the conditions attached to it are unworkable, they are argued. Conditions can also be varied later if your circumstances change."},{"title":"Staying here or going up","body":"An either-way offence can stay in the magistrates’ court or be sent to the Crown Court. There are real advantages both ways, and the decision is taken with advice rather than on the day."},{"title":"Trial before the bench","body":"Magistrates and district judges decide the facts as well as the law. Cross-examination and the order of the evidence are prepared with that in mind."},{"title":"Sentence and mitigation","body":"Where sentence follows, the guidelines set the range and the mitigation moves you within it. The supporting material is gathered beforehand, not mentioned in passing at the hearing."}],"process":[{"title":"The first conversation","body":"Tell me what you are charged with and when you are due at court. There is no charge for that conversation."},{"title":"Before the hearing","body":"The prosecution papers are obtained and gone through with you, so you arrive knowing what is being said and what is likely to happen."},{"title":"On the day","body":"I meet you before you go in, and I am the person who stands up for you — not a duty solicitor introduced to you in the corridor."},{"title":"After the hearing","body":"Whatever the outcome, you leave understanding what it means and what the next step is, including any appeal."}]}'::jsonb)
  ) as v (service_slug, published, content)
join public.services s on s.slug = v.service_slug
where not exists (
  select 1 from public.service_pages p where p.service_id = s.id
);

-- 3. The two renames.
update public.services as s
set name = v.name,
    content = s.content || v.patch,
    updated_at = now()
from (values
    ('criminal-defence'::text, 'All Crime'::text, '{"icon":"alert","statute":"Every allegation, not just motoring","intro":"There is no crime that I haven’t dealt with before. Find out how I can help with all criminal allegations being made against you."}'::jsonb),
    ('all-crime'::text, 'Non-Motoring Crime'::text, '{"statute":"Legal aid and private instruction"}'::jsonb)
  ) as v (slug, name, patch)
where s.slug = v.slug;

-- 4. The heading on the general crime page follows its card.
update public.service_pages as p
set content = p.content || '{"headline":"All crime.","emphasis":"Twenty years of it.","intro":"There is no crime John has not dealt with before. Alongside the motoring work, he represents people facing criminal allegations of every kind — from first arrest through to trial. The approach does not change: understand the case fully, explain it plainly, and prepare properly."}'::jsonb,
    updated_at = now()
from public.services s
where s.id = p.service_id
  and s.slug = 'criminal-defence';

-- 5. Card copy rewritten in the same pass.
update public.services as s
set content = s.content || v.patch,
    updated_at = now()
from (values
    ('failing-to-stop'::text, '{"intro":"Did you not realise that there had been an accident? Too afraid to engage with the driver? Find out how we defend these cases."}'::jsonb),
    ('driver-details'::text, '{"intro":"Convicted in absence because you never received the paperwork? Find out how to re-open these cases in order to set the record straight."}'::jsonb),
    ('police-station'::text, '{"intro":"Cases can make or break at the Police Station. Find out how I can help you avoid ever having to go to Court."}'::jsonb)
  ) as v (slug, patch)
where s.slug = v.slug;
