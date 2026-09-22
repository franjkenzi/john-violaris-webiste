"use server";

import { redirect } from "next/navigation";

import { isIconName } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth";
import {
  formError,
  readCheckbox,
  readFields,
  validateFields,
  type CmsFormState,
} from "@/lib/cms/form";
import { revalidateFor } from "@/lib/cms/revalidate";
import { cmsWrite } from "@/lib/cms/write";
import {
  blogCategoryFields,
  blogCategoryRules,
  blogPostFields,
  blogPostRules,
  emptyBlogCategoryValues,
  estimateReadTime,
  readSections,
  validateSections,
  type BlogCategoryField,
  type BlogPostField,
  type BlogPostFormState,
} from "@/lib/cms/blog/schema";
import type { BlogPostContent } from "@/lib/cms/types";
import { createClient } from "@/utils/supabase/server";

/**
 * Blog mutations.
 *
 * Everything here runs through `cmsWrite`, which confirms the caller is an
 * admin, runs the statement under the caller's own RLS, rebuilds the affected
 * routes and hands back a form state. What is left in each action is its field
 * list and its query — which is the whole point of the wrapper.
 */

/** The public URL of an article, for revalidation. */
function articlePath(slug: string): string {
  return `/blog/${slug}`;
}

/**
 * Create or update an article.
 *
 * A create redirects to the new post's editor so the next save is an update
 * rather than a second insert. `redirect()` throws to unwind, so it is called
 * after `cmsWrite` has returned rather than inside it.
 */
export async function saveBlogPost(
  _previous: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await requireAdmin();

  const id = formData.get("id");
  const postId = typeof id === "string" && id ? id : null;

  const submitted = readFields(formData, blogPostFields);
  const published = readCheckbox(formData, "published");
  const sections = readSections(formData);

  const validation = validateFields(submitted, blogPostRules);
  const sectionErrors = validateSections(sections);

  if (!validation.ok || Object.keys(sectionErrors).length > 0) {
    return {
      ...formError(
        submitted,
        validation.ok ? {} : validation.fieldErrors,
        "Some details need checking before this can be saved.",
      ),
      sectionErrors,
    };
  }

  const values = validation.values;
  const fieldErrors: Partial<Record<BlogPostField, string>> = {};

  // Checks a per-field rule cannot express, because they depend on each other.
  if (!isIconName(values.icon)) {
    fieldErrors.icon = "Choose an icon from the list.";
  }

  if (values.featuredImage && !values.featuredImageAlt) {
    fieldErrors.featuredImageAlt =
      "Describe the image for anyone who cannot see it. An image with no description is invisible to a screen reader.";
  }

  // A draft may be empty — that is what a draft is for. A published article
  // may not: it would be a headline with nothing underneath it.
  if (published && sections.length === 0) {
    fieldErrors.excerpt =
      "An article needs at least one section before it can be published.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ...formError(values, fieldErrors), sectionErrors: {} };
  }

  const content: BlogPostContent = {
    excerpt: values.excerpt,
    standfirst: values.standfirst,
    readTime: values.readTime || estimateReadTime(sections),
    icon: values.icon,
    body: sections,
    ...(values.relatedService ? { relatedService: values.relatedService } : {}),
    ...(values.featuredImage ? { featuredImage: values.featuredImage } : {}),
    ...(values.featuredImageAlt
      ? { featuredImageAlt: values.featuredImageAlt }
      : {}),
  };

  /**
   * Publishing with no date set dates the article now. Leaving it null would
   * put a newly published article at the bottom of an index ordered by date,
   * which reads as a bug rather than as a decision.
   */
  const publishedAt = values.publishedAt
    ? new Date(`${values.publishedAt}T09:00:00Z`).toISOString()
    : published
      ? new Date().toISOString()
      : null;

  const row = {
    slug: values.slug,
    title: values.title,
    category_id: values.categoryId || null,
    published,
    published_at: publishedAt,
    content,
  };

  // The slug may have changed, so the old URL needs rebuilding too or it stays
  // cached and serving under a name nothing points at any more.
  const previousSlug = formData.get("previousSlug");
  const paths = [articlePath(values.slug)];

  if (typeof previousSlug === "string" && previousSlug && previousSlug !== values.slug) {
    paths.push(articlePath(previousSlug));
  }

  const state = await cmsWrite<BlogPostField, { id: string } | null>({
    entity: "blog-posts",
    values,
    successMessage: published ? "Article saved and published." : "Draft saved.",
    paths,
    run: async (supabase) =>
      postId
        ? supabase.from("blog_posts").update(row).eq("id", postId).select("id").maybeSingle()
        : supabase.from("blog_posts").insert(row).select("id").maybeSingle(),
  });

  if (state.status === "success" && !postId && state.data?.id) {
    // Straight into the editor for the article that now exists, so the next
    // save updates it rather than inserting a second one. This is why `run`
    // selects the id back.
    redirect(`/admin/blog-posts/${state.data.id}`);
  }

  // Rebuilt field by field rather than spread: `data` stays on the server, and
  // the editor gets the form state and nothing else.
  return {
    status: state.status,
    message: state.message,
    fieldErrors: state.fieldErrors,
    values: state.values,
    sectionErrors: {},
  };
}

/**
 * Publish or unpublish from the list, without opening the article.
 *
 * Called inside a transition rather than as a form action, so the row can paint
 * the new state optimistically. Arguments are still treated as untrusted: a
 * Server Action is a public POST endpoint whatever calls it.
 */
export async function setBlogPostPublished(id: string, published: boolean) {
  await requireAdmin();

  if (typeof id !== "string" || typeof published !== "boolean") return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle<{ slug: string; published_at: string | null }>();

  if (!existing) return;

  const { error } = await supabase
    .from("blog_posts")
    .update({
      published,
      // First publish dates the article; unpublishing keeps the date, so
      // republishing later does not silently present it as brand new.
      published_at:
        published && !existing.published_at
          ? new Date().toISOString()
          : existing.published_at,
    })
    .eq("id", id);

  if (error) {
    console.error(`[cms] Failed to change publish state of post ${id}`, error);

    return;
  }

  revalidateFor("blog-posts", [articlePath(existing.slug)]);
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");

  if (typeof id !== "string") return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle<{ slug: string }>();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    console.error(`[cms] Failed to delete post ${id}`, error);

    return;
  }

  revalidateFor("blog-posts", existing ? [articlePath(existing.slug)] : []);
  redirect("/admin/blog-posts");
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function saveBlogCategory(
  _previous: CmsFormState<BlogCategoryField>,
  formData: FormData,
): Promise<CmsFormState<BlogCategoryField>> {
  await requireAdmin();

  const id = formData.get("id");
  const categoryId = typeof id === "string" && id ? id : null;

  const submitted = readFields(formData, blogCategoryFields);
  const validation = validateFields(submitted, blogCategoryRules);

  if (!validation.ok) {
    return formError(submitted, validation.fieldErrors);
  }

  const values = validation.values;
  const row = { name: values.name, slug: values.slug };

  return cmsWrite<BlogCategoryField>({
    entity: "blog-categories",
    values: categoryId ? values : emptyBlogCategoryValues,
    successMessage: categoryId ? "Category renamed." : "Category added.",
    run: async (supabase) =>
      categoryId
        ? supabase.from("blog_categories").update(row).eq("id", categoryId).select()
        : supabase.from("blog_categories").insert(row).select(),
  });
}

/**
 * Delete a category.
 *
 * `on delete set null` on `blog_posts.category_id` means posts survive and fall
 * back to the default label rather than disappearing with the category. The
 * admin list shows the count beforehand so that is a decision, not a surprise.
 */
export async function deleteBlogCategory(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");

  if (typeof id !== "string") return;

  const supabase = await createClient();

  const { error } = await supabase.from("blog_categories").delete().eq("id", id);

  if (error) {
    console.error(`[cms] Failed to delete category ${id}`, error);

    return;
  }

  // Posts that referenced it now render the default label, so the index and
  // every article page are both stale.
  revalidateFor("blog-categories");
  revalidateFor("blog-posts");
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export type ImageUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const maxImageBytes = 5 * 1024 * 1024;

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/**
 * Upload a featured image and return its public URL.
 *
 * The bucket enforces the same size and type limits, but they are checked here
 * first so a rejection is a sentence John can read rather than a storage error
 * code, and so nothing is sent over the wire that is going to be refused.
 *
 * Filenames are generated rather than taken from the upload: a name off
 * someone's desktop can collide, can carry characters a URL has to escape, and
 * is one of the classic ways a storage bucket gets an object written where it
 * was not expected.
 */
export async function uploadBlogImage(
  formData: FormData,
): Promise<ImageUploadResult> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }

  if (file.size > maxImageBytes) {
    return {
      ok: false,
      error: "That image is over 5 MB. Please resize it and try again.",
    };
  }

  if (!allowedImageTypes.has(file.type)) {
    return {
      ok: false,
      error: "Images must be JPEG, PNG, WebP or AVIF.",
    };
  }

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `posts/${crypto.randomUUID()}.${extension}`;

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[cms] Image upload failed", error);

    return {
      ok: false,
      error: "The image could not be uploaded. Please try again.",
    };
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);

  return { ok: true, url: data.publicUrl };
}
