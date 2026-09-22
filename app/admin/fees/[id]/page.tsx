import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeeForm } from "@/components/admin/fee-form";
import { getFee } from "@/lib/cms/admin-queries";
import { feeValuesFrom } from "@/lib/cms/fees/schema";
import { formatUkShortDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Edit fee",
};

export default async function EditFeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fee = await getFee(id);

  if (!fee) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Edit fee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last edited{" "}
          <time dateTime={fee.updated_at}>
            {formatUkShortDateTime(fee.updated_at)}
          </time>
          .{" "}
          {fee.published
            ? "This fee is live on the fees page."
            : "This fee is a draft and is not visible to visitors."}
        </p>
      </header>

      <FeeForm
        // Keyed by id so navigating between two fees rebuilds the editor
        // rather than carrying the previous fee's checkbox state across.
        key={fee.id}
        fee={{
          id: fee.id,
          values: feeValuesFrom(fee),
          published: fee.published,
          tableOnly: fee.content.tableOnly === true,
        }}
      />
    </div>
  );
}
