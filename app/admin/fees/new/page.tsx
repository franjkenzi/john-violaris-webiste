import type { Metadata } from "next";

import { FeeForm } from "@/components/admin/fee-form";

export const metadata: Metadata = {
  title: "Add fee",
};

export default function NewFeePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Add fee</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Nothing appears on the fees page until you tick Published. Save it as
          a draft as often as you like while you are settling the figure.
        </p>
      </header>

      <FeeForm fee={null} />
    </div>
  );
}
