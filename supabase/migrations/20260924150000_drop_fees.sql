/*
 * Drop the fee schedule.
 *
 * John does not want fee details on the site. The fees page now explains how
 * fees are worked out without giving a figure, and the schedule, its admin
 * editor and every read of this table were removed with it. Keeping the rows
 * would have been worse than removing them: published rows stayed readable
 * through the public API with the anon key, so the figures were still being
 * published, just not on a page.
 *
 * The index, the updated_at trigger and the RLS policies from
 * `20260914103000_create_cms_content_tables.sql` belong to the table and go
 * with it. The seed and `20260922160000_add_adjourned_hearing_fee.sql` still
 * insert into it, and still can: they run before this on a fresh database.
 */

drop table if exists public.fees;
