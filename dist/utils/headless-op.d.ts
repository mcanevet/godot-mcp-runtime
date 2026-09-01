import type { GodotRunner } from './godot-runner.js';
import type { HandlerResult, OperationParams } from '../mcp.types.js';
/**
 * Wraps the execute + empty-stdout-check + try/catch around a headless GDScript
 * operation. Used by the 15 scene/node mutation handlers in tools/scene-tools.ts
 * and tools/node-tools.ts to eliminate identical error-handling duplication.
 *
 * Handlers retain control of: parameter normalization, project/scene validation,
 * field validation, and constructing the `params` object — those run before the
 * call. Returns the canonical `Result<ToolSuccessPayload, ToolResponse>` shape;
 * the dispatch edge maps it back to the MCP wire envelope.
 */
export declare function executeSceneOp(runner: GodotRunner, operation: string, params: OperationParams, projectPath: string, failurePrefix: string, emptyStdoutSolutions: string[], exceptionSolutions?: string[], options?: {
    parseStdoutAsJson?: boolean;
}): Promise<HandlerResult>;
//# sourceMappingURL=headless-op.d.ts.map