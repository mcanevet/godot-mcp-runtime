/**
 * .tscn / project.godot parsing helpers shared by the run-script security
 * pipeline. Parallel in style to `autoload-ini.ts` — line-oriented INI/TSCN
 * parsing, no Godot process required.
 *
 * Responsibilities:
 *  - Resolve the scene a `run_project` call will actually launch (explicit
 *    `scene` arg > `run/main_scene` in [application] > null).
 *  - Extract the list of `[ext_resource type="Script" path="res://..."]`
 *    references from a .tscn file, mapped to absolute project-relative paths.
 *  - Recurse transitively into `[ext_resource type="PackedScene"]` references
 *    so a script attached to a subscene the launched scene instances is
 *    caught too (`collectSceneScriptsRecursive`).
 *
 * Not chased (documented limitation, not a TODO — see `docs/security.md`):
 * inline `[sub_resource type="GDScript"]` scripts embedded directly in the
 * .tscn, and `[instance]` property overrides. Both would need a separate
 * parsing pipeline beyond ext_resource line-scanning.
 */
/**
 * Read `run/main_scene` from `[application]` in project.godot. Returns the
 * `res://...` string if present, else null. Does NOT verify the file exists.
 */
export declare function readMainSceneFromProject(projectDir: string): string | null;
/**
 * Pick the scene that `run_project` will actually launch.
 *
 * Resolution order:
 *  1. Explicit `sceneArg` (caller's `scene` parameter) — already validated by
 *     `validateSubPath` before being passed here. Returned as an absolute path.
 *  2. `run/main_scene` from project.godot, with `res://` stripped and joined
 *     to the project root.
 *  3. null — no scene to scan. Caller logs a warning and skips the scene-script
 *     scan; autoload scan still runs.
 *
 * Returns an absolute filesystem path. Does NOT verify the file exists; the
 * caller's `existsSync` check produces the warning if the resolved path is
 * stale.
 */
export declare function resolveLaunchScene(projectDir: string, sceneArg?: string | null): string | null;
/**
 * Extract top-level `[ext_resource type="Script" path="res://..."]` references
 * from a .tscn file. Returns absolute filesystem paths relative to the project
 * root.
 *
 * Limitations (intentional — see `docs/security.md`):
 *  - Does NOT chase `[sub_resource type="GDScript"]` inline scripts — those
 *    embed GDScript source inside the .tscn and would need a separate scan
 *    pipeline.
 *  - Does NOT account for `[instance]` property overrides.
 *  - Returns paths even if the file does not exist on disk; caller is
 *    responsible for the existence check (and recording a warning).
 *
 * Does NOT recurse into `[ext_resource type="PackedScene"]` references — use
 * `collectSceneScriptsRecursive` for the transitive walk across subscenes.
 */
export declare function extractSceneScripts(scenePath: string, projectDir: string): string[];
/**
 * Transitively walk `[ext_resource type="PackedScene"]` references starting
 * at `scenePath`, unioning every reachable scene's `type="Script"`
 * ext_resources. Closes the subscene-recursion gap in `extractSceneScripts`:
 * a hostile script attached to a PackedScene the launched scene instances is
 * invisible to a single-scene scan.
 *
 * Cycle-safe: scene graphs can reference each other in a cycle, so visited
 * scenes (by resolved absolute path) are never re-walked. Missing scene
 * files are skipped silently, same as `extractSceneScripts` — a stale
 * reference must not crash the run_project pre-flight.
 *
 * Returns the de-duplicated union of script paths (absolute).
 */
export declare function collectSceneScriptsRecursive(scenePath: string, projectDir: string): string[];
//# sourceMappingURL=scene-parsing.d.ts.map