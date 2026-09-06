/**
 * Normalize a path for cross-platform comparison.
 * Folds Windows backslashes to forward slashes and strips trailing slashes,
 * so Node's `path.normalize` output matches Godot's `globalize_path("res://")`.
 */
export declare function normalizeForCompare(p: string): string;
/**
 * Extract JSON from Godot output by finding the first { or [ and matching to the end.
 * This strips debug logs, version banners, and other noise.
 */
export declare function extractJson(output: string): string;
/**
 * Strip Godot banner and debug lines from output, keeping only meaningful content.
 */
export declare function cleanOutput(output: string): string;
export declare function cleanStdout(stdout: string): string;
//# sourceMappingURL=output-parsing.d.ts.map