/**
 * Parsing and editing primitives for the `[autoload]` section of project.godot.
 *
 * Used by:
 *  - tools/autoload-tools.ts — list/add/remove/update_autoload handlers
 *  - utils/bridge-manager.ts — McpBridge inject/cleanup/repair
 *
 * Pure functions: each takes the absolute path to project.godot and returns
 * either parsed data or a boolean indicating whether the file was mutated.
 */
export interface AutoloadEntry {
    name: string;
    path: string;
    singleton: boolean;
}
/**
 * Matches an empty `[autoload]` section (the header followed by only blank
 * lines, up to the next section header or end-of-file). Used by cleanup paths
 * to drop the section after the last entry is removed.
 */
export declare const EMPTY_AUTOLOAD_SECTION_REGEX: RegExp;
/**
 * Mirrors the parser's `\w+` assumption (parseAutoloads / removeAutoloadEntry).
 * Enforced on write paths to prevent a name with newlines or INI section
 * delimiters from corrupting project.godot.
 */
export declare const VALID_AUTOLOAD_NAME_REGEX: RegExp;
/**
 * Iterate every non-blank, non-comment data line inside the named INI section
 * of `content`. The callback receives each line with its surrounding whitespace
 * trimmed. Stops only at end of content; the callback should return a falsy
 * value to continue or any truthy value to short-circuit.
 *
 * Used wherever code needs to read a single project.godot section without
 * spinning up Godot — `[autoload]`, `[application]`, etc. The shared walker
 * keeps the section-header + skip-comment skeleton in one place.
 */
export declare function walkIniSection(content: string, sectionName: string, onLine: (trimmed: string) => boolean | void): void;
export declare function normalizeAutoloadPath(p: string): string;
export declare function parseAutoloads(projectFilePath: string, existingContent?: string): AutoloadEntry[];
export declare function addAutoloadEntry(projectFilePath: string, name: string, path: string, singleton: boolean, existingContent?: string): void;
/**
 * Remove the named autoload entry. Also drops the `[autoload]` section header
 * if the removed entry was the last one in it. Returns true when the file was
 * mutated.
 */
export declare function removeAutoloadEntry(projectFilePath: string, name: string): boolean;
export declare function updateAutoloadEntry(projectFilePath: string, name: string, newPath?: string, singleton?: boolean): boolean;
//# sourceMappingURL=autoload-ini.d.ts.map