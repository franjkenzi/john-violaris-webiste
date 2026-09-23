"use server";

import { requireAdmin } from "@/lib/auth";
import {
  formError,
  formFailure,
  readCheckbox,
  readFields,
  validateFields,
  type CmsFormState,
} from "@/lib/cms/form";
import { revalidateFor } from "@/lib/cms/revalidate";
import {
  emptyServicePageValues,
  requiredToPublish,
  servicePageFields,
  servicePageItemFields,
  servicePageRules,
  type ServicePageField,
  type ServicePageItemField,
} from "@/lib/cms/service-pages/schema";
import type { SectionItem } from "@/lib/cms/sections/schema";
import { readItems } from "@/lib/cms/sections/values";
import type { ServiceContent, ServicePageContent } from "@/lib/cms/types";
import type { PenaltyCard, TableRow } from "@/lib/content/service-detail";
import { cmsWrite } from "@/lib/cms/write";
import { createClient } from "@/utils/supabase/server";

/**
 * Offence-page mutations.
 *
 * A page belongs to exactly one service — `service_pages.service_id` is
 * unique — so a page is addressed by its service throughout. Saving is an
 * upsert on that column: the first save of a service that has no page yet
 * creates one, and every later save updates it, with no round trip to find out
 * which.
 *
 * The page's own URL is the only public route it appears on, beyond the
 * services index `revalidate.ts` already lists, so each write passes it.
 */

type Owner = { slug: string; content: Pick<ServiceContent, "href"> };

function pagePath(slug: string): string {
  return `/services/${slug}`;
}

/**
 * What a published page cannot be without, or null when it is complete.
 *
 * Shared by the editor's save and the list's publish button, so a draft
 * cannot be published half-written from the list when the editor would have
 * refused it.
 */
function missingToPublish(
  content: Partial<ServicePageContent>,
): Partial<Record<ServicePageField, string>> | null {
  const missing: Partial<Record<ServicePageField, string>> = {};

  for (const field of requiredToPublish) {
    if (!content[field]) {
      missing[field] = `${servicePageRules[field].label} is needed before the page can be published.`;
    }
  }

  if (!content.penalties?.length) {
    missing.penalties =
      "A published page needs at least one at-a-glance card.";
  }

  if (!content.defenceIssues?.length) {
    missing.defenceIssues =
      "A published page needs at least one point in this list.";
  }

  return Object.keys(missing).length > 0 ? missing : null;
}

export async function saveServicePage(
  _previous: CmsFormState<ServicePageField>,
  formData: FormData,
): Promise<CmsFormState<ServicePageField>> {
  await requireAdmin();

  const submitted = {
    ...emptyServicePageValues,
    ...readFields(formData, servicePageFields),
  };
  const published = readCheckbox(formData, "published");

  const id = formData.get("serviceId");
  const serviceId = typeof id === "string" ? id : "";

  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select("slug, content")
    .eq("id", serviceId)
    .maybeSingle<Owner>();

  if (!service) {
    return formFailure(
      submitted,
      "This service no longer exists — it may have been deleted in another tab.",
    );
  }

  // The list never offers this, but a Server Action is a public endpoint.
  if (service.content.href) {
    return formFailure(
      submitted,
      "This service links to a page of its own, which is edited under Website content.",
    );
  }

  const validation = validateFields(
    readFields(formData, servicePageFields),
    servicePageRules,
  );

  const fieldErrors: Partial<Record<ServicePageField, string>> = validation.ok
    ? {}
    : { ...validation.fieldErrors };

  const items = {} as Record<ServicePageItemField, SectionItem[]>;

  for (const field of servicePageItemFields) {
    const key = field.key as ServicePageItemField;
    const result = readItems(field, formData);

    items[key] = result.items;

    if (result.error) fieldErrors[key] = result.error;
  }

  if (!validation.ok || Object.keys(fieldErrors).length > 0) {
    return formError(submitted, fieldErrors);
  }

  const values = { ...submitted, ...validation.values };

  // `process` is stored but not edited here — see the schema — so the save
  // carries over whatever the page already holds.
  const { data: existing } = await supabase
    .from("service_pages")
    .select("content")
    .eq("service_id", serviceId)
    .maybeSingle<{ content: Partial<ServicePageContent> }>();

  const content: ServicePageContent = {
    headline: values.headline,
    emphasis: values.emphasis,
    intro: values.intro,
    penalties: items.penalties as PenaltyCard[],
    issuesHeading: values.issuesHeading,
    issuesIntro: values.issuesIntro,
    defenceIssues: items.defenceIssues as ServicePageContent["defenceIssues"],
    process: existing?.content.process ?? [],
    // Absent rather than empty, as the seeded pages have them: the page reads
    // an absent table as "fall back" or "leave the section out".
    ...(items.outcomes.length > 0
      ? { outcomes: items.outcomes as TableRow[] }
      : {}),
    ...(items.ancillaryOrders.length > 0
      ? { ancillaryOrders: items.ancillaryOrders as TableRow[] }
      : {}),
  };

  // A draft may be incomplete — that is what a draft is for. A published page
  // may not: it would render headings with nothing under them.
  const missing = published ? missingToPublish(content) : null;

  if (missing) {
    return formError(
      values,
      missing,
      "The page needs a few more things before it can be published. Untick Published to save it as a draft.",
    );
  }

  return cmsWrite({
    entity: "service-pages",
    values,
    successMessage: published ? "Page saved and published." : "Draft saved.",
    paths: [pagePath(service.slug)],
    run: async (client) =>
      client
        .from("service_pages")
        .upsert(
          { service_id: serviceId, published, content },
          { onConflict: "service_id" },
        )
        .select("id")
        .maybeSingle(),
  });
}

/**
 * Publish or unpublish from the list.
 *
 * Publishing checks the stored page the way the editor's save does, and
 * refuses an incomplete one. The list's button then settles back to Draft,
 * and the editor is where the reason is shown.
 */
export async function setServicePagePublished(id: string, published: boolean) {
  await requireAdmin();

  if (typeof id !== "string" || typeof published !== "boolean") return;

  const supabase = await createClient();

  const { data: page } = await supabase
    .from("service_pages")
    .select("content, services!inner(slug)")
    .eq("id", id)
    .maybeSingle<{
      content: Partial<ServicePageContent>;
      services: { slug: string };
    }>();

  if (!page) return;

  if (published && missingToPublish(page.content)) return;

  const { error } = await supabase
    .from("service_pages")
    .update({ published })
    .eq("id", id);

  if (error) {
    console.error(`[cms] Failed to change publish state of service page ${id}`, error);

    return;
  }

  revalidateFor("service-pages", [pagePath(page.services.slug)]);
}
