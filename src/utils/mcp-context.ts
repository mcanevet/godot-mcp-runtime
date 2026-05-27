/**
 * Request-scoped context threaded through tool dispatch.
 *
 * Carries the elicitor (used by `run_script` / `run_project` to pause for
 * user confirmation on Tier 2 findings), the global strict-mode flag, and
 * per-session state (currently the once-per-project gate for `run_project`).
 *
 * The strict-mode flag is read from `process.env.GODOT_MCP_STRICT` exactly
 * once when the context is built. Toggling the env var after the server
 * starts has no effect.
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Result of an elicitation prompt. Mirrors `ElicitResult` from
 * `@modelcontextprotocol/sdk` but typed as a minimal shape so test fakes
 * don't need to import the full SDK.
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
 * Abstraction over the MCP `Server.elicitInput` call. Real server wires
 * through to `server.elicitInput(...)`; tests pass a fake that returns a
 * scripted decision.
 *
 * Throws when the client does not support elicitation; callers should
 * treat a thrown error as a denial.
 */
export interface Elicitor {
  elicit(request: ElicitorRequest): Promise<ElicitorResult>;
}

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

function readStrictModeFromEnv(): boolean {
  return process.env.GODOT_MCP_STRICT === 'true';
}

/**
 * Build a context backed by a live MCP `Server`. The strict-mode flag is
 * captured at construction; restart the server to change it.
 */
export function createContextFromServer(server: Server): McpContext {
  const elicitor: Elicitor = {
    async elicit(request) {
      // The SDK's elicitInput param type is a strict zod-inferred shape; we
      // build the request with an `object`-shaped requestedSchema that matches
      // the protocol at runtime, so cast the whole params object to satisfy
      // the narrower TS check.
      const result = await server.elicitInput({
        message: request.message,
        requestedSchema: request.requestedSchema,
      } as unknown as Parameters<typeof server.elicitInput>[0]);
      const out: ElicitorResult = { action: result.action };
      if (result.content) {
        out.content = result.content as Record<string, unknown>;
      }
      return out;
    },
  };
  return {
    elicitor,
    strictMode: readStrictModeFromEnv(),
    sessionState: {
      runProjectConfirmed: new Set<string>(),
    },
  };
}

/**
 * Build a no-op context for test call sites. The elicitor always declines —
 * tests that need an accept path should construct their own context with a
 * scripted elicitor instead.
 */
export function createNullContext(overrides?: Partial<McpContext>): McpContext {
  return {
    elicitor: {
      async elicit() {
        return { action: 'decline' };
      },
    },
    strictMode: false,
    sessionState: {
      runProjectConfirmed: new Set<string>(),
    },
    ...overrides,
  };
}
