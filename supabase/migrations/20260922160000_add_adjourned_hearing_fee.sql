/*
 * The adjourned-hearing fee, which the original seed missed.
 *
 * `20260917111415_seed_cms_content.sql` seeded the six fees that have cards on
 * the fees page. This one only ever appeared in the full table underneath them,
 * so it lived in `lib/content/fees.ts` as `additionalDraftFee` and never became
 * a row — which meant it was the one figure on the page that no admin screen
 * could reach.
 *
 * `content.tableOnly` is how the page keeps it out of the card grid: it is an
 * add-on to an instruction rather than a way to instruct John, and a card
 * offering it beside the six real ones would misrepresent what it is.
 *
 * Guarded on the title rather than on the table being empty. The seed's own
 * `where not exists (select 1 from public.fees)` would never fire here because
 * the table already holds the other six, and a guard that never fires is a
 * migration that inserts a duplicate every time the database is reset.
 *
 * `sort_order` 60 continues the seed's tens, leaving room to slot a fee in
 * between two others without renumbering everything after it.
 */

insert into public.fees (title, price, published, sort_order, content)
select
  'Additional or adjourned hearing',
  '£500',
  true,
  60,
  '{"description":"Case management or an adjourned hearing","included":[],"tableOnly":true}'::jsonb
where not exists (
  select 1 from public.fees where title = 'Additional or adjourned hearing'
);
