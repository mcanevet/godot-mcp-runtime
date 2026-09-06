import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { CallToolRequest, Notification } from '@modelcontextprotocol/sdk/types.js';
/**
 * Interval between progress heartbeat notifications. The MCP spec lets
 * clients impose a per-request timeout (the SDK default is 60s) and reset it
 * when `resetTimeoutOnProgress` is set, but ONLY when the server sends
 * progress notifications. Long-running tools (run_script simulations,
 * playtests) routinely exceed 60s, so the server heartbeats to keep the
 * request alive for clients that opted in. Clients that did not opt in
 * ignore the notifications (their timeout behavior is unchanged).
 *
 * 20s gives 3 heartbeats per SDK-default 60s client timeout window.
 */
export declare const DEFAULT_HEARTBEAT_INTERVAL_MS = 20000;
/**
 * Extract the progress token a client attached to a tools/call request
 * (present only when the client registered an `onprogress` handler — the
 * SDK sends `_meta.progressToken` only then).
 */
export declare function progressTokenFrom(request: CallToolRequest): string | number | undefined;
/**
 * Start sending progress heartbeats for an in-flight tools/call request.
 *
 * Returns a stop function that MUST be called when the handler settles
 * (success or error); it is safe to call more than once and safe to call on
 * a heartbeat that never started (no token → no-op stopper).
 */
export declare function startProgressHeartbeat(extra: RequestHandlerExtra<never, Notification>, request: CallToolRequest, intervalMs?: number): () => void;
//# sourceMappingURL=progress-heartbeat.d.ts.map