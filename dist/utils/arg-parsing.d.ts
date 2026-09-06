/**
 * Generic field helpers + per-handler argument parsers.
 *
 * Each helper returns `Result<T, ToolResponse>` so handlers can compose
 * parsing with `if (!parsed.ok) return parsed.error` and never touch the
 * raw `OperationParams` index signature.
 *
 * Path-shaped helpers (`parseProjectArgs`, `parseSceneArgs`, `parseNodePath`)
 * are added in the same module alongside the generic kit so handlers have a
 * single import for argument parsing.
 */
import type { OperationParams, ToolResponse } from '../mcp.types.js';
import { type Result } from './result.js';
import type { NodePath, ProjectPath, ScenePath } from './branded.js';
export declare function requireString(args: OperationParams, key: string): Result<string, ToolResponse>;
export declare function optionalString(args: OperationParams, key: string): Result<string | undefined, ToolResponse>;
export declare function requireStringArray(args: OperationParams, key: string, opts?: {
    minLength?: number;
}): Result<string[], ToolResponse>;
export declare function optionalStringArray(args: OperationParams, key: string): Result<string[] | undefined, ToolResponse>;
export declare function requireNumber(args: OperationParams, key: string): Result<number, ToolResponse>;
export declare function optionalNumber(args: OperationParams, key: string): Result<number | undefined, ToolResponse>;
export declare function requireBoolean(args: OperationParams, key: string): Result<boolean, ToolResponse>;
export declare function optionalBoolean(args: OperationParams, key: string): Result<boolean | undefined, ToolResponse>;
export declare function requireObject(args: OperationParams, key: string): Result<Record<string, unknown>, ToolResponse>;
export declare function optionalObject(args: OperationParams, key: string): Result<Record<string, unknown> | undefined, ToolResponse>;
export declare function requireArray(args: OperationParams, key: string, opts?: {
    minLength?: number;
}): Result<unknown[], ToolResponse>;
/**
 * Parse and validate `projectPath` from raw args. The returned brand confirms
 * the path has been shape-checked AND the `project.godot` manifest exists on
 * disk — handlers can use the value verbatim without re-validating.
 */
export declare function parseProjectArgs(args: OperationParams): Result<{
    projectPath: ProjectPath;
}, ToolResponse>;
/**
 * Parse and validate `projectPath` + `scenePath`. Two independent concerns:
 *
 * - Presence: `scenePath` must always be provided (you must say *where* the
 *   scene is or will be) — there is no opt-out.
 * - Existence: when `requireExists` is true (default), the scene file must
 *   already exist on disk. Pass `{ requireExists: false }` for operations
 *   like `create_scene` that write a scene to a path that need not exist yet.
 */
export declare function parseSceneArgs(args: OperationParams, opts?: {
    requireExists?: boolean;
}): Result<{
    projectPath: ProjectPath;
    scenePath: ScenePath;
}, ToolResponse>;
/**
 * Brand a string as a scene-tree NodePath after validating its shape. Use
 * for fields that hold a node path (e.g. `nodePath`, `parentNodePath`,
 * `targetNodePath`) — scene-tree paths live in a separate namespace from
 * filesystem paths and the project-root containment check does not apply.
 */
export declare function parseNodePath(raw: string, fieldName?: string): Result<NodePath, ToolResponse>;
export declare function parseRequiredNodePath(args: OperationParams, key: string): Result<NodePath, ToolResponse>;
export declare function parseOptionalNodePath(args: OperationParams, key: string): Result<NodePath | undefined, ToolResponse>;
//# sourceMappingURL=arg-parsing.d.ts.map