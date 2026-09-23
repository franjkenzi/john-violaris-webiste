"use server";

import { requireAdmin } from "@/lib/auth";
import {
  formError,
  formFailure,
  readCheckbox,
  readFields,
  validateFields,
} from "@/lib/cms/form";
import { findSeoRoute } from "@/lib/cms/seo/routes";
import {
  emptySeoValues,
  isAddress,
  seoFields,
  seoRules,
  type SeoField,
  type SeoFormState,
} from "@/lib/cms/seo/schema";
import type { SeoContent } from "@/lib/cms/types";
import { cmsWrite } from "@/lib/cms/write";

/**
 * SEO override mutations.
 *
 * An override is keyed by the page's path, and the path arrives in the form.
 * A Server Action is a public endpoint, so the path is looked up in the route
 * registry before anything is written: an address that is not a public page is
 * refused, rather than accepted into a table the site then reads from.
 *
 * `revalidate.ts` already rebuilds the sitemap for this entity; each write adds
 * the page itself.
 */

function readPath(formData: FormData): string {
  const value = formData.get("path");

  return typeof value === "string" ? value : "";
}

export async function saveSeo(
  _previous: SeoFormState,
  formData: FormData,
): Promise<SeoFormState> {
  await requireAdmin();

  const path = readPath(formData);
  const submitted = readFields(formData, seoFields);

  if (!(await findSeoRoute(path))) {
    return formFailure(
      submitted,
      "That page is not one this site publishes. Reload the list and try again.",
    );
  }

  /*
   * "Reset to defaults" is this form's second submit button rather than a form
   * of its own, so its answer comes back through the editor's state — which
   * is how the editor knows to empty the fields that still hold the override
   * it just removed. Deleting rather than blanking, for the reason below.
   */
  if (formData.get("intent") === "reset") {
    const state = await cmsWrite({
      entity: "seo-metadata",
      values: emptySeoValues,
      successMessage: "Reset. The page uses its defaults again.",
      paths: [path],
      run: async (supabase) =>
        supabase.from("seo_metadata").delete().eq("path", path).select("path"),
    });

    return {
      status: state.status,
      message: state.message,
      fieldErrors: state.fieldErrors,
      values: state.status === "success" ? emptySeoValues : submitted,
      reset: state.status === "success",
    };
  }

  const noIndex = readCheckbox(formData, "noIndex");
  const noFollow = readCheckbox(formData, "noFollow");

  const validation = validateFields(submitted, seoRules);

  if (!validation.ok) {
    return formError(submitted, validation.fieldErrors);
  }

  const values = validation.values;
  const fieldErrors: Partial<Record<SeoField, string>> = {};

  if (values.canonical && !isAddress(values.canonical)) {
    fieldErrors.canonical =
      "Use an address on this site starting with /, or a full address starting with https://.";
  }

  if (values.ogImage && !isAddress(values.ogImage)) {
    fieldErrors.ogImage = "Upload the image again — that address cannot be used.";
  }

  if (values.ogImage && !values.ogImageAlt) {
    fieldErrors.ogImageAlt =
      "Describe the image for anyone who cannot see it. An image with no description is invisible to a screen reader.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return formError(values, fieldErrors);
  }

  // Only what was filled in. The alt text goes with its image: a description
  // left behind after the image was removed would describe nothing.
  const content: SeoContent = {
    ...(values.title ? { title: values.title } : {}),
    ...(values.description ? { description: values.description } : {}),
    ...(values.canonical ? { canonical: values.canonical } : {}),
    ...(values.ogTitle ? { ogTitle: values.ogTitle } : {}),
    ...(values.ogDescription ? { ogDescription: values.ogDescription } : {}),
    ...(values.ogImage
      ? { ogImage: values.ogImage, ogImageAlt: values.ogImageAlt }
      : {}),
    ...(noIndex ? { noIndex: true as const } : {}),
    ...(noFollow ? { noFollow: true as const } : {}),
  };

  const isEmpty = Object.keys(content).length === 0;

  const state = await cmsWrite({
    entity: "seo-metadata",
    values,
    successMessage: isEmpty
      ? "Saved. With nothing overridden, the page uses its defaults."
      : "SEO settings saved.",
    paths: [path],
    // An override with nothing in it is no override: the row is removed rather
    // than kept empty, so "has this page been customised?" is simply "does it
    // have a row?" — which is what the list shows.
    run: async (supabase) =>
      isEmpty
        ? supabase.from("seo_metadata").delete().eq("path", path).select("path")
        : supabase
            .from("seo_metadata")
            .upsert({ path, content }, { onConflict: "path" })
            .select("path"),
  });

  // Rebuilt field by field rather than spread: `data` stays on the server.
  return {
    status: state.status,
    message: state.message,
    fieldErrors: state.fieldErrors,
    values: state.values,
  };
}
