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
 *
 * Subscene recursion (scanning scripts attached to PackedScenes referenced
 * by the launched scene) is out of scope for v1 — see CLAUDE.md "run_script
 * security" for rationale. Autoload scan (always-on) covers the higher-leverage
 * attack surface.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { projectGodotPath, stripResPrefix } from './path-validation.js';
import { walkIniSection } from './autoload-ini.js';

function isFileNotFound(err: unknown): boolean {
  return (err as NodeJS.ErrnoException | null)?.code === 'ENOENT';
}

/**
 * Read `run/main_scene` from `[application]` in project.godot. Returns the
 * `res://...` string if present, else null. Does NOT verify the file exists.
 */
export function readMainSceneFromProject(projectDir: string): string | null {
  const projectFile = projectGodotPath(projectDir);
  let content: string;
  try {
    content = readFileSync(projectFile, 'utf8');
  } catch (err) {
    if (isFileNotFound(err)) return null;
    throw err;
  }
  let mainScene: string | null = null;
  walkIniSection(content, 'application', (trimmed) => {
    // Match: run/main_scene="res://main.tscn"  (quotes are always present
    // when Godot writes; tolerate omitted quotes for hand-edited files).
    const match = trimmed.match(/^run\/main_scene\s*=\s*"?([^"]+?)"?$/);
    if (match && match[1]) {
      mainScene = match[1];
      return true;
    }
  });
  return mainScene;
}

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
export function resolveLaunchScene(projectDir: string, sceneArg?: string | null): string | null {
  if (sceneArg) {
    return join(projectDir, stripResPrefix(sceneArg));
  }
  const main = readMainSceneFromProject(projectDir);
  if (!main) return null;
  return join(projectDir, stripResPrefix(main));
}

/**
 * Extract top-level `[ext_resource type="Script" path="res://..."]` references
 * from a .tscn file. Returns absolute filesystem paths relative to the project
 * root.
 *
 * Limitations (intentional, v1):
 *  - Does NOT recurse into `[ext_resource type="PackedScene"]` references.
 *  - Does NOT chase `[sub_resource type="GDScript"]` inline scripts — those
 *    embed GDScript source inside the .tscn and would need a separate scan
 *    pipeline.
 *  - Returns paths even if the file does not exist on disk; caller is
 *    responsible for the existence check (and recording a warning).
 */
export function extractSceneScripts(scenePath: string, projectDir: string): string[] {
  let content: string;
  try {
    content = readFileSync(scenePath, 'utf8');
  } catch (err) {
    if (isFileNotFound(err)) return [];
    throw err;
  }
  const result: string[] = [];
  // ext_resource lines look like:
  //   [ext_resource type="Script" path="res://scripts/foo.gd" id="1_xxx"]
  // or with uid="...":
  //   [ext_resource type="Script" uid="..." path="res://..." id="..."]
  // We do a permissive match: `type="Script"` somewhere in the line + a
  // `path="res://..."` clause.
  const lineRe = /^\[ext_resource\b([^\]]*)\]/;
  for (const rawLine of content.split('\n')) {
    const match = rawLine.match(lineRe);
    if (!match) continue;
    const attrs = match[1] ?? '';
    if (!/type\s*=\s*"Script"/.test(attrs)) continue;
    const pathMatch = attrs.match(/path\s*=\s*"([^"]+)"/);
    if (!pathMatch || !pathMatch[1]) continue;
    const stripped = stripResPrefix(pathMatch[1]);
    if (!stripped.endsWith('.gd')) continue;
    result.push(join(projectDir, stripped));
  }
  return result;
}
