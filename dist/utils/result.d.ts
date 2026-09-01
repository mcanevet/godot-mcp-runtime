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
export type Result<T, E> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare const ok: <T>(value: T) => Result<T, never>;
export declare const err: <E>(error: E) => Result<never, E>;
export declare const isOk: <T, E>(r: Result<T, E>) => r is {
    ok: true;
    value: T;
};
export declare const isErr: <T, E>(r: Result<T, E>) => r is {
    ok: false;
    error: E;
};
//# sourceMappingURL=result.d.ts.map