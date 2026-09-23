"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadBlogImage } from "@/lib/cms/blog/actions";

/**
 * Choose, upload and preview an image — an article's featured image, or a
 * page's share image under SEO Metadata.
 *
 * The upload happens as soon as a file is chosen rather than on save, so the
 * preview is of the real stored object and the URL is already in the form by
 * the time the article is submitted. What the form carries is that URL, in a
 * hidden input — the file itself never rides along with the article save.
 *
 * The value is lifted, not local: the alt-text field beside this one is
 * required whenever an image is set, and the form needs to know.
 */
export function ImageField({
  name,
  value,
  onChange,
  describedBy,
  folder = "posts",
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  describedBy?: string;
  /** Where the upload is stored: article images, or pages' share images. */
  folder?: "posts" | "share";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(file: File | undefined) {
    if (!file) return;

    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const result = await uploadBlogImage(formData);

      if (result.ok) {
        onChange(result.url);
      } else {
        setError(result.error);
      }

      // Clearing the input is what lets the same file be chosen again after a
      // failure; a file input fires no change event for an unchanged value.
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
            <Image
              src={value}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
              // The preview is decorative here: the real description lives in
              // the alt-text field beside it, which is what gets published.
              unoptimized
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange("")}
          >
            <X aria-hidden="true" />
            Remove image
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {pending ? "Uploading…" : "Upload an image"}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        aria-describedby={describedBy}
        tabIndex={-1}
        onChange={(event) => choose(event.target.files?.[0])}
      />

      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
