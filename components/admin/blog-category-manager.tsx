"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";
import { deleteBlogCategory, saveBlogCategory } from "@/lib/cms/blog/actions";
import { initialBlogCategoryFormState } from "@/lib/cms/blog/schema";
import { slugify } from "@/lib/slug";

/**
 * Add, rename and remove blog categories.
 *
 * Each row is its own form with its own action state, so a failed rename shows
 * its error on the row it belongs to rather than at the top of the page. The
 * add form is the same component with no category behind it.
 */

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  /** Articles currently filed under it, so deleting is an informed decision. */
  postCount: number;
};

export function BlogCategoryManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4 md:p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Add a category</h2>
        <CategoryForm category={null} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Categories</h2>

        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No categories yet. Articles can be published without one.
          </p>
        ) : (
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category.id} className="rounded-xl border p-4">
                <CategoryForm category={category} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CategoryForm({ category }: { category: CategoryRow | null }) {
  const formId = useId();
  const isNew = category === null;

  const [state, formAction] = useActionState(saveBlogCategory, {
    ...initialBlogCategoryFormState,
    values: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    },
  });

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  // An existing category's slug is a published URL segment, so it never
  // follows the name. A new one does, until it is typed in.
  const [slugTouched, setSlugTouched] = useState(!isNew);

  /**
   * After a successful add, empty the row so the next category can be typed.
   *
   * Adjusted during render rather than in an effect. The inputs are controlled,
   * so clearing them from an effect would paint the submitted values once and
   * then blank them a frame later; comparing against the last state handled
   * does it in the same pass. This is React's own "adjusting state when props
   * change" pattern.
   */
  const [handled, setHandled] = useState(state);

  if (state !== handled) {
    setHandled(state);

    if (isNew && state.status === "success") {
      setName("");
      setSlug("");
      setSlugTouched(false);
    }
  }

  return (
    <div className="space-y-3">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        {category ? (
          <input type="hidden" name="id" value={category.id} />
        ) : null}

        <div className="min-w-44 flex-1 space-y-1.5">
          <Label htmlFor={`${formId}-name`}>Name</Label>
          <Input
            id={`${formId}-name`}
            name="name"
            value={name}
            aria-invalid={state.fieldErrors.name ? true : undefined}
            aria-describedby={
              state.fieldErrors.name ? `${formId}-name-error` : undefined
            }
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
        </div>

        <div className="min-w-44 flex-1 space-y-1.5">
          <Label htmlFor={`${formId}-slug`}>URL slug</Label>
          <Input
            id={`${formId}-slug`}
            name="slug"
            value={slug}
            aria-invalid={state.fieldErrors.slug ? true : undefined}
            aria-describedby={
              state.fieldErrors.slug ? `${formId}-slug-error` : undefined
            }
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
          />
        </div>

        <SubmitButton isNew={isNew} />
      </form>

      {category ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {category.postCount === 0
              ? "No articles use this category."
              : `${category.postCount} ${category.postCount === 1 ? "article uses" : "articles use"} this category.`}
          </p>
          <DeleteCategory category={category} />
        </div>
      ) : null}

      {state.fieldErrors.name ? (
        <p
          id={`${formId}-name-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {state.fieldErrors.name}
        </p>
      ) : null}
      {state.fieldErrors.slug ? (
        <p
          id={`${formId}-slug-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {state.fieldErrors.slug}
        </p>
      ) : null}
      {state.message && Object.keys(state.fieldErrors).length === 0 ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "text-sm",
            state.status === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant={isNew ? "default" : "outline"} disabled={pending}>
      {isNew ? <Plus aria-hidden="true" /> : null}
      {pending ? "Saving…" : isNew ? "Add category" : "Save"}
    </Button>
  );
}

/**
 * Deleting a category leaves its articles in place — `on delete set null` on
 * `blog_posts.category_id` — so the warning says what actually happens rather
 * than implying the articles go with it.
 */
function DeleteCategory({ category }: { category: CategoryRow }) {
  return (
    <form
      action={deleteBlogCategory}
      onSubmit={(event) => {
        const consequence =
          category.postCount === 0
            ? ""
            : ` ${category.postCount} ${category.postCount === 1 ? "article" : "articles"} will stay published without a category.`;

        if (!window.confirm(`Delete the category "${category.name}"?${consequence}`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={category.id} />
      <Button type="submit" variant="ghost" size="sm">
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
    </form>
  );
}
