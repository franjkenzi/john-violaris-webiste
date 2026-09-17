/*
 * Storage for article images (PRD §6.7, §13).
 *
 * One public bucket. The images are featured images on published articles —
 * they are meant to be fetched by anyone reading the blog, and serving them
 * through signed URLs would mean re-signing on every static render for no
 * privacy gain.
 *
 * Writing is another matter: only an admin may upload, replace or remove an
 * object, enforced by the same `private.is_admin()` predicate the content
 * tables use. Uploads still go through a server action, so the check that the
 * file is an image of a sane size happens before Postgres is asked at all.
 *
 * Follows the convention of `20260914103000_create_cms_content_tables.sql`:
 * public read, admin write, nothing granted to `anon` beyond select.
 */

-- `on conflict do nothing` so a re-run, or a bucket someone created by hand in
-- the dashboard, is left alone rather than failing the migration.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  -- 5 MB. Large enough for a photograph off a phone, small enough that nothing
  -- uploaded here can quietly become the slowest thing on the page.
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;


-- Anyone may read. The bucket is public, and this is the policy that says so
-- for direct object requests as well as public URLs.
create policy "Anyone can read blog images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'blog-images');

-- Admins may upload, replace and remove.
create policy "Admins can upload blog images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blog-images' and private.is_admin());

create policy "Admins can update blog images"
on storage.objects for update
to authenticated
using (bucket_id = 'blog-images' and private.is_admin())
with check (bucket_id = 'blog-images' and private.is_admin());

create policy "Admins can delete blog images"
on storage.objects for delete
to authenticated
using (bucket_id = 'blog-images' and private.is_admin());
