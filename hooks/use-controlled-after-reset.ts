"use client";

import { useEffect, useReducer, type RefObject } from "react";

/**
 * Put a form's controlled checkboxes and selects back after React resets it.
 *
 * React resets a form once its action settles, and `form.reset()` returns
 * every control to its *default*: a checkbox to `defaultChecked`, a select to
 * its `defaultSelected` option. React keeps those defaults in step with the
 * current value for text inputs and textareas, but not for these two, and it
 * does not re-render after the reset. So a controlled checkbox or select shows
 * its page-load state while React still holds the current one — and the next
 * submission sends what is on screen. Unticking Published, saving, and then
 * saving again would publish the page; a second save of an offence page turned
 * every gold card red.
 *
 * The `reset` event fires before the reset is applied. Re-rendering in answer
 * to it lets React write its own values back over the defaults, which is the
 * one thing it already does on every render.
 *
 * The contact form keeps its own narrower fix for its single, uncontrolled
 * select; this is for the admin forms, where every checkbox and select is
 * controlled.
 */
export function useControlledAfterReset(
  formRef: RefObject<HTMLFormElement | null>,
) {
  const [, rerender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    const form = formRef.current;

    if (!form) return;

    form.addEventListener("reset", rerender);

    return () => form.removeEventListener("reset", rerender);
  }, [formRef]);
}
