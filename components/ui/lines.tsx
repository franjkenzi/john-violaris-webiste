import { Fragment, type ReactNode } from "react";

/**
 * Render a `lines` field, one line per line.
 *
 * Several headings and standfirsts break at a chosen point — "Your defence…"
 * above "My personal attention." — and that break is a design decision rather
 * than the browser wrapping text. Storing those fields as a list of lines means
 * an editor types lines and never types markup, and the component decides what
 * a break is made of.
 *
 * `separator` is for the places where the break is conditional: the hero's
 * introduction breaks only from the `sm` breakpoint up, and its heading breaks
 * only below it, so each passes a `<br>` that is hidden at the other size. The
 * default is a plain `<br />`.
 *
 * A conditional separator is followed by a space, and it has to be. When the
 * break is hidden the two lines sit on one line, and without the space they
 * would run together — "My personalattention." A space after an unconditional
 * `<br />` would be dropped anyway, as leading whitespace at the start of a
 * line, but it is not emitted there: nothing needs it, and the markup stays as
 * it was written.
 */
export function Lines({
  values,
  separator,
}: {
  values: string[];
  separator?: ReactNode;
}) {
  return (
    <>
      {values.map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? separator ? <>{separator} </> : <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Render a `prose` field as paragraphs.
 *
 * `className` lands on each paragraph, because that is how the existing markup
 * is written — the section styles its own `<p>`s rather than a wrapper.
 */
export function Paragraphs({
  values,
  className,
}: {
  values: string[];
  className?: string;
}) {
  return (
    <>
      {values.map((paragraph, index) => (
        <p key={index} className={className}>
          {paragraph}
        </p>
      ))}
    </>
  );
}
