/**
 * Teaches plain `node` the `@/*` path alias from `tsconfig.json`.
 *
 * The seed generator imports the same modules the app does, and the app writes
 * every internal import as `@/lib/...`. Rather than make one module use
 * relative paths just so a build script can read it, the script brings its own
 * resolver: `node --import ./scripts/alias-hook.mjs ...`.
 *
 * Node 24's `registerHooks` is synchronous and in-thread, so this runs before
 * the TypeScript type stripping that handles the `.ts` files themselves.
 */
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const root = process.cwd();

/** Extensionless imports are a bundler convenience; node wants the real file. */
const candidates = ["", ".ts", ".tsx", ".mts", ".js", "/index.ts", "/index.tsx"];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) {
      return nextResolve(specifier, context);
    }

    const base = `${root}/${specifier.slice(2)}`;

    for (const extension of candidates) {
      const path = base + extension;

      if (existsSync(path)) {
        return { url: pathToFileURL(path).href, shortCircuit: true };
      }
    }

    throw new Error(`Could not resolve "${specifier}" under ${root}`);
  },
});
