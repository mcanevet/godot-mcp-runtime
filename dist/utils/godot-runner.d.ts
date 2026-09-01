import type { ChildProcess } from 'child_process';
import type { OperationParams } from '../mcp.types.js';
/**
 * Thrown when the bridge socket closes (Godot exited, port closed, or peer
 * dropped the connection mid-flight). Lets callers distinguish
 * "session ended" from generic transport errors.
 */
export declare class BridgeDisconnectedError extends Error {
    constructor(message: string);
}
export interface GodotProcess {
    process: ChildProcess;
    output: string[];
    errors: string[];
    totalErrorsWritten: number;
    exitCode: number | null;
    hasExited: boolean;
    sessionToken: string;
}
export type RuntimeSessionMode = 'spawned' | 'attached';
export interface RuntimeStopResult {
    mode: RuntimeSessionMode;
    output: string[];
    errors: string[];
    externalProcessPreserved?: boolean;
}
export interface GodotServerConfig {
    godotPath?: string;
    debugMode?: boolean;
}
export interface OperationResult {
    stdout: string;
    stderr: string;
}
export declare class GodotRunner {
    private godotPath;
    private operationsScriptPath;
    private bridge;
    private validatedPaths;
    private cachedVersion;
    activeProcess: GodotProcess | null;
    activeProjectPath: string | null;
    activeSessionMode: RuntimeSessionMode | null;
    activeBridgePort: number | null;
    private activeSessionToken;
    private socket;
    private rxChunks;
    private rxTotal;
    private inFlight;
    constructor(config?: GodotServerConfig);
    private isValidGodotPathSync;
    private spawnAsync;
    private isValidGodotPath;
    detectGodotPath(): Promise<void>;
    getGodotPath(): string | null;
    /**
     * Read the port currently baked into the project's bridge script. Returns
     * null if the file is missing or malformed. Thin pass-through to
     * BridgeManager — used by bridge-wait-timeout race detection.
     */
    readBakedBridgePort(projectPath: string): number | null;
    getVersion(): Promise<string>;
    executeOperation(operation: string, params: OperationParams, projectPath: string, timeoutMs?: number): Promise<OperationResult>;
    launchEditor(projectPath: string): ChildProcess;
    runProject(projectPath: string, scene?: string, background?: boolean, bridgePort?: number): Promise<GodotProcess>;
    attachProject(projectPath: string, bridgePort?: number): Promise<void>;
    stopProject(): Promise<RuntimeStopResult | null>;
    hasActiveRuntimeSession(): boolean;
    /**
     * Send a JSON command to the McpBridge over a long-lived TCP connection.
     *
     * MCP serializes tool calls so we hold one in-flight command at a time. The
     * socket is lazy-connected on first call and persists across commands until
     * `closeConnection` (or a peer-side close). A close mid-flight rejects with
     * `BridgeDisconnectedError`; a per-command timeout rejects but does NOT
     * close the socket — a slow command does not invalidate the session.
     */
    sendCommand(command: string, params?: Record<string, unknown>, timeoutMs?: number): Promise<string>;
    /**
     * Tear down the bridge socket. Idempotent. Any in-flight command is
     * rejected with a session-ended error.
     */
    closeConnection(): void;
    private resetRxBuffer;
    getErrorCount(): number;
    getErrorsSince(marker: number): string[];
    private static readonly SCRIPT_ERROR_PATTERNS;
    private static readonly RETRYABLE_BRIDGE_COMMANDS;
    extractRuntimeErrors(lines: string[]): string[];
    private sendCommandWithReconnect;
    sendCommandWithErrors(command: string, params?: Record<string, unknown>, timeoutMs?: number): Promise<{
        response: string;
        runtimeErrors: string[];
    }>;
    /**
     * Shared poll loop for `waitForBridge` (spawned) and `waitForBridgeAttached`.
     * Sends `ping` payloads until the bridge replies with a pong that
     * `validatePong` accepts, the deadline passes, or `shouldAbort` reports
     * the spawned process has exited.
     */
    private pollBridge;
    waitForBridgeAttached(timeoutMs?: number, intervalMs?: number): Promise<{
        ready: boolean;
        error?: string;
    }>;
    waitForBridge(timeoutMs?: number, intervalMs?: number): Promise<{
        ready: boolean;
        error?: string;
    }>;
    getRecentErrors(count?: number): string[];
}
//# sourceMappingURL=godot-runner.d.ts.map