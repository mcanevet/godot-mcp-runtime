/**
 * Check whether a display server (X11 / Wayland) is available on the current
 * platform.  On macOS and Windows the display subsystem is always present;
 * on Linux we probe the standard environment variables.
 */
export declare function checkDisplayAvailable(): boolean;
export declare function validatePath(path: string): boolean;
/**
 * Strip a leading `res://` (Godot's project-root URI) from a project resource
 * path. Returns the input unchanged if no prefix is present.
 */
export declare function stripResPrefix(path: string): string;
/**
 * Stricter check for paths that must stay inside `projectPath`. Rejects `..`
 * (via `validatePath`) and absolute paths that escape the project root.
 * `path.join('/project', '/etc/passwd')` resolves to `/etc/passwd`, so the
 * basic `..`-substring check alone permits absolute-path traversal.
 *
 * Tolerates a leading `res://` by stripping it before resolving — autoload
 * entries and resource paths use this prefix.
 */
export declare function validateSubPath(projectPath: string, userPath: string): boolean;
/**
 * Validate a Godot scene-tree path (NodePath). Scene-tree paths are a
 * separate namespace from filesystem paths — they address nodes inside
 * a scene, not files on disk, so the project-root containment check
 * in `validateSubPath` does not apply.
 *
 * Rejects empty strings and `..` segments. Accepts both relative
 * (`root/Player`) and absolute (`/root/Player`) Godot forms; the
 * codebase convention is the relative form.
 */
export declare function validateNodePath(path: string): boolean;
/**
 * True when `child` resolves to `parent` or a path beneath it. Used by
 * defense-in-depth checks on bridge-returned paths (e.g. screenshot files
 * that must live under `.mcp/screenshots/`).
 */
export declare function isUnderDir(parent: string, child: string): boolean;
/**
 * Build the absolute path to a project's `project.godot` manifest. Use this
 * instead of `join(dir, 'project.godot')` ad hoc.
 */
export declare function projectGodotPath(projectDir: string): string;
//# sourceMappingURL=path-validation.d.ts.map