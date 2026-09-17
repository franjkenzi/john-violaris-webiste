import type { Metadata } from "next";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { loadEditorData } from "@/lib/cms/blog/editor-data";

export const metadata: Metadata = {
  title: "New article",
};

export default async function NewBlogPostPage() {
  const { categories, services } = await loadEditorData();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">New article</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Nothing is visible to visitors until you tick Published. Save as a
          draft as often as you like while you are writing.
        </p>
      </header>

      <BlogPostForm post={null} categories={categories} services={services} />
    </div>
  );
}
