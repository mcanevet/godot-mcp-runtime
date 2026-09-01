/**
 * Wire format shared between the Node-side `GodotRunner.sendCommand` and the
 * GDScript-side `McpBridge` autoload.
 *
 * KEEP IN SYNC: src/scripts/mcp_bridge.gd implements the same framing on the
 * Godot side. Any change here MUST be mirrored there (and vice versa).
 *
 * Frame: 4-byte big-endian length prefix + UTF-8 JSON payload.
 * Max frame size is 16 MiB; oversize frames are rejected on receive.
 *
 * Request frame contract (additive): every request JSON payload is
 * `{ command: string, token?: string, ...params }`. `sendCommand` in
 * `godot-runner.ts` attaches the per-session auth token; the bridge rejects
 * any frame whose `token` doesn't match its configured session token (see
 * `_dispatch_command` in `mcp_bridge.gd`). This is a best-effort accident
 * guard against unauthenticated local processes finding the bridge port, not
 * a hard security boundary — see `docs/security.md`.
 */
export declare const DEFAULT_BRIDGE_PORT = 9900;
export declare const MAX_FRAME_BYTES: number;
export declare const FRAME_HEADER_BYTES = 4;
export declare const BRIDGE_WAIT_SPAWNED_TIMEOUT_MS = 8000;
/**
 * Find an available TCP port by binding to port 0 (OS-assigned ephemeral port),
 * reading the assigned port, and closing the listener. The brief TOCTOU window
 * between close and the consumer's listen is acceptable — if a collision occurs,
 * the bridge readiness check will surface the failure.
 */
export declare function findFreePort(): Promise<number>;
/**
 * Encode a JSON string as a length-prefixed frame.
 */
export declare function encodeFrame(payload: string): Buffer;
export interface ParseFramesResult {
    frames: Buffer[];
    remainder: Buffer;
}
/**
 * Pull as many complete frames as possible from a streaming buffer. Any
 * partial frame at the tail is returned as `remainder` for the next call.
 *
 * Throws if a header advertises a payload larger than {@link MAX_FRAME_BYTES} —
 * the caller should treat this as a fatal protocol error and close the socket.
 */
export declare function parseFrames(buffer: Buffer): ParseFramesResult;
//# sourceMappingURL=bridge-protocol.d.ts.map