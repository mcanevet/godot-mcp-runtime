/**
 * Request-scoped context threaded through tool dispatch.
 *
 * Carries the elicitor (used by `run_script` / `run_project` to pause for
 * user confirmation on Tier 2 findings), the global strict-mode flag, and
 * per-session state (currently the once-per-project gate for `run_project`).
 *
 * The strict-mode flag is captured when the context is built (see
 * `createContextFromServer` in `src/index.ts`). Toggling `GODOT_MCP_STRICT`
 * after the server starts has no effect.
 */

/**
 * Result of an elicitation prompt. Mirrors the SDK's `ElicitResult` shape
 * without importing it, so the utils layer stays decoupled from the MCP SDK.
 */
export interface ElicitorResult {
  action: 'accept' | 'decline' | 'cancel';
  content?: Record<string, unknown>;
}

export interface ElicitorRequest {
  message: string;
  requestedSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: readonly string[];
  };
}

/**
 * Async function that prompts the user via the MCP elicitation channel.
 * Throws when the client does not support elicitation; callers should treat
 * a thrown error as a denial.
 */
export type Elicitor = (request: ElicitorRequest) => Promise<ElicitorResult>;

export interface SessionState {
  /**
   * Set of absolute project paths for which the user has already approved
   * `run_project` in this server session. First call against each path
   * elicits; later calls skip.
   */
  runProjectConfirmed: Set<string>;
}

export interface McpContext {
  elicitor: Elicitor;
  strictMode: boolean;
  sessionState: SessionState;
}

/**
 * Build a no-op context for test call sites. The elicitor always declines —
 * tests that need an accept path should construct their own context with a
 * scripted elicitor instead.
 */
export function createNullContext(overrides?: Partial<McpContext>): McpContext {
  return {
    elicitor: async () => ({ action: 'decline' }),
    strictMode: false,
    sessionState: {
      runProjectConfirmed: new Set<string>(),
    },
    ...overrides,
  };
}
