/**
 * Deployment prefix for everything Next does not rewrite on its own.
 *
 * `basePath` in next.config covers routing and the /_next asset graph, but it
 * does not touch three things this site relies on:
 *   - next/image sources when `unoptimized` is set, because the src is emitted
 *     verbatim instead of being wrapped in the optimizer route
 *   - URLs declared inside a Metadata object
 *   - absolute paths this app resolves itself, such as the JSON-LD image fields
 *
 * On a GitHub Pages project site those all resolve against the user-site root
 * and 404. Anything built by hand from a /public path goes through here.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefixes a root-relative /public path. Pass-through when deployed at root. */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
