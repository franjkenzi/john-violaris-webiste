-- Replaces the nine placeholder reviews with the two real ones from John's
-- ReviewSolicitors profile.
--
-- The seed migration carries the real pair for a fresh database, but it is
-- guarded by `where not exists`, so a database seeded before this keeps the
-- placeholders — invented reviews, on the homepage, presented as a client's
-- words. That is the one thing PRD §17 rules out, so they go.
--
-- Deletion is matched on the exact placeholder quotes rather than clearing the
-- table. Anything John has written or imported since stays where it is, and
-- re-running this on a database that has already had it changes nothing.
--
-- `content.source` is set on the new rows, which it never was on a placeholder.
-- It names the platform the review was collected on, and it is what separates a
-- verified review from an unverified one anywhere the CMS reads them.
--
-- Full reviews: https://www.reviewsolicitors.co.uk/london/london/ioannis-violaris

delete from public.testimonials
where quote in (
    'John kept my licence when I genuinely thought it was gone. He dealt with the case personally from the first call to the court hearing.',
    'Calm, thorough, and completely honest from day one. He told me exactly what to expect at every stage and never oversold it.',
    'He was the only solicitor who actually listened carefully before quoting me. When you''re facing a ban, that attention to detail matters enormously.',
    'I was arrested on a Sunday evening and John was at the station that night. Having someone there who explained the process changed everything for me.',
    'He found a problem with how the sample had been handled that nobody else had spotted. The charge did not go anywhere after that.',
    'My drink had been spiked and I assumed nobody would believe me. John built the special reasons argument properly and I avoided disqualification.',
    'Straight answers, no jargon, and he never once made me feel judged. He replied to emails himself, usually the same day.',
    'The outcome was not everything I hoped for, but John was realistic with me from the start and worked hard on the mitigation. I would still recommend him.',
    'Twelve points and a family that depends on me driving. He prepared the hardship evidence meticulously and I kept my licence.'
  );

-- Guarded per review, not per table: a database that already holds one of them
-- is not a reason to skip the other, and neither is a database John has since
-- added a third review to.
insert into public.testimonials (author, quote, rating, published, sort_order, content)
select v.author, v.quote, v.rating, v.published, v.sort_order, v.content
from (values
    ('Henry Parsons'::text, 'John explained the situation clearly, identified that the prosecution’s evidence had weaknesses, and negotiated a resolution that kept me on the road. He was the only solicitor I called who actually listened to the details before quoting me.'::text, 5::smallint, true, 0::integer, '{"matter":"Driving offences","source":"ReviewSolicitors"}'::jsonb),
    ('Joanna'::text, 'Fantastic service and excellent communication. Very reasonably priced and would highly recommend. Thank you!'::text, 5::smallint, true, 10::integer, '{"source":"ReviewSolicitors"}'::jsonb)
  ) as v (author, quote, rating, published, sort_order, content)
where not exists (
    select 1 from public.testimonials as t where t.quote = v.quote
  );
