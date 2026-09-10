/** Turn a heading into an anchor id — used to link the contents rail to it. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’'"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
