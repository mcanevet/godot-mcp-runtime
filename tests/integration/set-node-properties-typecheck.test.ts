/**
 * Regression tests for type-invalid property assignments (silent-success gap).
 *
 * Context: `_coerce_property_value` maps Vector/Color dicts but has no
 * dict→Resource path. Assigning such a value to a Resource-typed property
 * via `node.set()` either fails or stores a mismatched value — but the tool
 * previously reported `success: true`, so agents believed the write landed
 * (observed in MythicQuest runs: `properties={"shape": {"size": {...}}}`
 * on CollisionShape2D silently dropping). The fix: after `set()`, verify
 * `node.get(property)` actually holds the assigned value; mismatch becomes
 * an explicit per-property error.
 *
 * Requires GODOT_PATH. Skipped in CI without it.
 */

import { describe, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { cpSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { itGodot } from '../helpers/godot-skip.js';
import { fixtureProjectPath } from '../helpers/fixture-paths.js';
import { GodotRunner } from '../../src/utils/godot-runner.js';
import { extractJson } from '../../src/utils/output-parsing.js';

function makeTmpProject(): string {
  const id = randomBytes(6).toString('hex');
  const dst = join(tmpdir(), `godot-mcp-test-${id}`);
  cpSync(fixtureProjectPath, dst, { recursive: true });
  return dst;
}

const tmpDirs: string[] = [];

let runner: GodotRunner;

beforeAll(async () => {
  runner = new GodotRunner({ godotPath: process.env.GODOT_PATH });
  await runner.detectGodotPath();
});

beforeEach(() => {
  tmpDirs.push(makeTmpProject());
});

afterAll(() => {
  for (const dir of tmpDirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
});

describe('set_node_properties type validation (silent-success gap)', () => {
  itGodot(
    'errors when a dict value is assigned to a Resource-typed property (was silent success)',
    async () => {
      const tmpProject = tmpDirs[tmpDirs.length - 1];
      const scenePath = join(tmpProject, 'main.tscn');

      // Create a CollisionShape2D node to mutate.
      await runner.executeOperation(
        'add_node',
        {
          scenePath: 'main.tscn',
          nodeType: 'CollisionShape2D',
          nodeName: 'ShapeHolder',
          parentNodePath: '.',
        },
        tmpProject,
        30000,
      );

      // Attempt to set the `shape` property (Shape2D, a Resource) to a bare
      // dictionary — the classic silent-drop case from MythicQuest runs.
      const { stdout } = await runner.executeOperation(
        'set_node_properties',
        {
          scenePath: 'main.tscn',
          updates: [{ nodePath: 'ShapeHolder', property: 'shape', value: { x: 100, y: 50 } }],
        },
        tmpProject,
        30000,
      );

      const parsed = JSON.parse(extractJson(stdout));
      expect(parsed.results[0].error).toMatch(/cannot|fail|invalid|mismatch|type/i);
      expect(parsed.results[0].success).toBeUndefined();
      // And nothing was persisted for this property.
      const sceneText = readFileSync(scenePath, 'utf-8');
      expect(sceneText).not.toMatch(/shape\s*=/);
    },
    60000,
  );

  itGodot(
    'still succeeds for valid Vector dict values (no regression)',
    async () => {
      const tmpProject = tmpDirs[tmpDirs.length - 1];
      const scenePath = join(tmpProject, 'main.tscn');

      const { stdout } = await runner.executeOperation(
        'set_node_properties',
        {
          scenePath: 'main.tscn',
          updates: [{ nodePath: '.', property: 'position', value: { x: 10, y: 20 } }],
        },
        tmpProject,
        30000,
      );

      const parsed = JSON.parse(extractJson(stdout));
      expect(parsed.results[0].success).toBe(true);
      const sceneText = readFileSync(scenePath, 'utf-8');
      expect(sceneText).toContain('position = Vector2(10, 20)');
    },
    60000,
  );
});
