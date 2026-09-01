/**
 * Request-scoped context threaded through tool dispatch.
 *
 * Carries the elicitor (used by `run_script` / `run_project` to pause for
 * user confirmation on Tier 2 findings), the global strict-mode flag, the
 * disable-elicitation flag, and per-session state (currently the
 * once-per-project gate for `run_project`).
 *
 * The strict-mode and no-elicit flags are captured when the context is built
 * (see `createContextFromServer` in `src/index.ts`). Toggling `GODOT_MCP_STRICT`
 * or `GODOT_MCP_DISABLE_ELICITATION` after the server starts has no effect.
 */
/**
 * Normalize an absolute project path for use as a key in `runProjectConfirmed`.
 * Windows paths are case-insensitive at the filesystem level, so two calls with
 * `D:\proj` and `d:\proj` would otherwise be treated as distinct projects and
 * each trigger their own elicitation. Lowercasing on win32 collapses them.
 */
export function normalizeProjectKey(absPath) {
    return process.platform === 'win32' ? absPath.toLowerCase() : absPath;
}
/**
 * Build a no-op context for test call sites. The elicitor always declines —
 * tests that need an accept path should construct their own context with a
 * scripted elicitor instead.
 */
export function createNullContext(overrides) {
    return {
        elicitor: async () => ({ action: 'decline' }),
        strictMode: false,
        disableElicitation: false,
        sessionState: {
            runProjectConfirmed: new Set(),
        },
        ...overrides,
    };
}
//# sourceMappingURL=mcp-context.js.map