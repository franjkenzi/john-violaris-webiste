"use client";

/**
 * A confirmed action — delete, revert — whose button sits inside an editor
 * form but whose form cannot.
 *
 * HTML does not allow one form inside another. The browser drops the inner
 * `<form>` tag when it parses the server's HTML, so the button joins the
 * editor form: until React had hydrated, "Delete fee" submitted the fee's
 * *save*, and the mismatch then failed hydration on every editor that had
 * one (React error #418).
 *
 * So this form is rendered after the editor form, holds nothing but its hidden
 * fields, and is reached by a button elsewhere through the `form` attribute:
 * `<Button type="submit" form={id}>`. The button stays where it always was.
 *
 * The confirm sits on the submit event rather than the button's click, so a
 * keyboard submit is caught too.
 */
export function DetachedActionForm({
  id,
  action,
  confirmMessage,
  fields,
}: {
  /** What the button's `form` attribute names. */
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  /** Hidden inputs, by name. */
  fields: Record<string, string>;
}) {
  return (
    <form
      id={id}
      action={action}
      hidden
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  );
}
