/**
 * Unified Result shape used across the handler/parser/dispatch boundary.
 *
 * Replaces two divergent conventions that grew up before this: the isError-
 * keyed discriminator on the legacy validators in `error-response.ts`, and the
 * local `ParseResult<T>` in `runtime-tools.ts` (`parseBridgeJson`). Both
 * collapse into `{ ok: true; value: T } | { ok: false; error: E }` so
 * handlers, parsers, and the dispatch edge can compose without re-implementing
 * the discriminator in each module.
 */
export const ok = (value) => ({ ok: true, value });
export const err = (error) => ({ ok: false, error });
export const isOk = (r) => r.ok;
export const isErr = (r) => !r.ok;
//# sourceMappingURL=result.js.map