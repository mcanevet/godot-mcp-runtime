import type { ToolResponse } from '../mcp.types.js';
/**
 * Return `error.message` when `error` is an `Error`, otherwise `'Unknown error'`.
 * Centralizes the catch-block boilerplate so handlers can build error responses
 * without repeating the `instanceof Error` ternary.
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Extract the first [ERROR] message from GDScript stderr output.
 * Falls back to a generic message if no [ERROR] line is found.
 */
export declare function extractGdError(stderr: string): string;
export declare function createErrorResponse(message: string, possibleSolutions?: string[]): ToolResponse & {
    isError: true;
};
//# sourceMappingURL=error-response.d.ts.map