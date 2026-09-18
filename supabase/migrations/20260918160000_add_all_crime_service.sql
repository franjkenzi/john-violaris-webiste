-- Adds the "All Crime" service and its page to the Representation group.
--
-- The seed migration carries both for a fresh database, but it is guarded by
-- `where not exists`, so a database that has already been seeded never sees a
-- service added after it was seeded. This migration inserts the two rows in
-- place.
--
-- Both statements are `where not exists` on the row itself, so re-applying this
-- to a database that already has the service — a freshly seeded one, for
-- instance — does nothing.
--
-- `sort_order` 402 puts it after Police Station (400) and Magistrates Court
-- (401): `toServiceGroups` rebuilds the menu from row order alone, so the
-- number here has to match the one the seed generator emits or a seeded
-- database and a fresh one would render the group differently.

insert into public.services (slug, name, published, sort_order, content)
select v.slug, v.name, v.published, v.sort_order, v.content
from (values
    ('all-crime'::text, 'All Crime'::text, true, 402::integer, '{"group":"Representation","icon":"document","statute":"Non-motoring offences","intro":"Charged with something other than a motoring offence? Find out where legal aid applies and when instructing privately is worth it."}'::jsonb)
  ) as v (slug, name, published, sort_order, content)
where not exists (
  select 1 from public.services where slug = 'all-crime'
);

-- Joined to the service by slug, exactly as the seed does, so the page lands
-- against the row inserted above whichever migration created it.
insert into public.service_pages (service_id, published, content)
select s.id, v.published, v.content
from (values
    ('all-crime'::text, true, '{"headline":"Motoring is the specialism.","emphasis":"It is not the limit.","intro":"Most of this practice is motoring defence, and that is deliberate. But twenty years in the criminal courts does not stop at the Road Traffic Act. Assault, dishonesty, drugs, public order — if you are facing an allegation heard in the magistrates’ court or the Crown Court, John can act, and will tell you first whether legal aid should be paying for it.","penalties":[{"label":"Fine to custody","note":"The range across these offences","tone":"risk"},{"label":"A criminal record","note":"Disclosable depending on the check","tone":"risk"},{"label":"Legal aid in most cases","note":"Checked before you are asked to pay","tone":"note"}],"issuesHeading":"What this covers","issuesIntro":"Non-motoring work is the smaller part of the practice, and it is offered on exactly the same terms as the rest of it. These are the points worth understanding before you instruct anybody privately.","defenceIssues":[{"title":"The offences","body":"Assault and public order, theft and other dishonesty, drugs, criminal damage, harassment and communications offences, and most other matters that reach the magistrates’ court or the Crown Court."},{"title":"Legal aid, said plainly","body":"A large proportion of people charged with a non-motoring offence qualify for criminal legal aid. If you are one of them, you will be told so in the first conversation. Paying privately for work the Legal Aid Agency would fund is rarely the right decision, and you will not be encouraged into it."},{"title":"Why clients still instruct privately","body":"Legal aid funds the work; it does not promise you the same solicitor at every hearing. Private instruction does — one person who has read the papers, heard your account, and will be the one standing up in court."},{"title":"Before any charge","body":"Advice at the police station is free under the legal aid scheme whatever you earn, and it is not generally means tested. You are entitled to ask for a named solicitor rather than the duty solicitor."},{"title":"Where the case is serious","body":"An either-way or indictable matter may be sent to the Crown Court. John will explain how allocation works, what it means for the case, and how representation is arranged from that point, including where counsel is instructed."},{"title":"Where it meets the motoring work","body":"Some cases carry both — a dangerous driving allegation with other charges attached, or a motoring matter arising out of a wider investigation. Those sit squarely within what this practice does already."}],"process":[{"title":"The first conversation","body":"Tell me what the allegation is and what stage it has reached. There is no charge for that conversation, and it includes a straight answer on funding."},{"title":"Settling the funding","body":"If legal aid is likely to cover you, I will explain how to apply. If it is not, or you would rather instruct privately, you have the scope of work and the fee before anything begins."},{"title":"Understanding the case","body":"The prosecution evidence is obtained and gone through with you, in plain terms, before any decision on plea is taken."},{"title":"At court","body":"Personal representation at every hearing. Where a case is sent to the Crown Court, counsel is chosen with you rather than for you."}]}'::jsonb)
  ) as v (service_slug, published, content)
join public.services s on s.slug = v.service_slug
where not exists (
  select 1 from public.service_pages p where p.service_id = s.id
);
