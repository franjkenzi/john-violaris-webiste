"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { deleteEnquiry } from "@/lib/enquiries/admin-actions";

/**
 * Deletion is permanent and is how an erasure request gets honoured, so it asks
 * first. The confirm sits on the form's submit event rather than the button's
 * click, so it also catches a keyboard submit.
 */
export function DeleteEnquiryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteEnquiry}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Permanently delete the enquiry from ${name}? This cannot be undone.`,
        );

        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
      <Trash2 aria-hidden="true" />
      {pending ? "Deleting…" : "Delete enquiry"}
    </Button>
  );
}
