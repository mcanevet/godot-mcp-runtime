/**
 * Tests for the .tscn / project.godot helpers used by run_project's pre-flight
 * scan. Mirrors the autoload-ini test layout: tmp project dirs, INI/TSCN
 * content as fixtures.
 */

import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  readMainSceneFromProject,
  resolveLaunchScene,
  extractSceneScripts,
} from '../../src/utils/scene-parsing.js';
import { stripResPrefix } from '../../src/utils/path-validation.js';
import { useTmpDirs } from '../helpers/tmp.js';

const tmp = useTmpDirs();

describe('stripResPrefix', () => {
  it('removes the leading res:// scheme', () => {
    expect(stripResPrefix('res://foo/bar.gd')).toBe('foo/bar.gd');
  });

  it('returns the input unchanged when no res:// prefix', () => {
    expect(stripResPrefix('foo/bar.gd')).toBe('foo/bar.gd');
  });
});

describe('readMainSceneFromProject', () => {
  it('returns the main scene from [application]', () => {
    const dir = tmp.makeProject(
      'main-scene-',
      'config_version=5\n\n[application]\nrun/main_scene="res://main.tscn"\n',
    );
    expect(readMainSceneFromProject(dir)).toBe('res://main.tscn');
  });

  it('returns null when the key is absent', () => {
    const dir = tmp.makeProject('main-scene-', 'config_version=5\n\n[application]\n');
    expect(readMainSceneFromProject(dir)).toBeNull();
  });

  it('returns null when project.godot is missing', () => {
    const dir = tmp.make('no-project-');
    expect(readMainSceneFromProject(dir)).toBeNull();
  });

  it('ignores main_scene keys outside [application]', () => {
    const dir = tmp.makeProject(
      'main-scene-',
      'config_version=5\n\n[autoload]\nrun/main_scene="res://decoy.tscn"\n',
    );
    expect(readMainSceneFromProject(dir)).toBeNull();
  });

  it('tolerates an unquoted value (hand-edited project.godot)', () => {
    const dir = tmp.makeProject(
      'main-scene-',
      'config_version=5\n\n[application]\nrun/main_scene=res://main.tscn\n',
    );
    expect(readMainSceneFromProject(dir)).toBe('res://main.tscn');
  });
});

describe('resolveLaunchScene', () => {
  it('prefers an explicit sceneArg over run/main_scene', () => {
    const dir = tmp.makeProject(
      'launch-scene-',
      'config_version=5\n\n[application]\nrun/main_scene="res://main.tscn"\n',
    );
    const resolved = resolveLaunchScene(dir, 'scenes/other.tscn');
    expect(resolved).toBe(join(dir, 'scenes/other.tscn'));
  });

  it('strips res:// from an explicit sceneArg', () => {
    const dir = tmp.makeProject('launch-scene-', 'config_version=5\n');
    const resolved = resolveLaunchScene(dir, 'res://scenes/other.tscn');
    expect(resolved).toBe(join(dir, 'scenes/other.tscn'));
  });

  it('falls back to run/main_scene when sceneArg is omitted', () => {
    const dir = tmp.makeProject(
      'launch-scene-',
      'config_version=5\n\n[application]\nrun/main_scene="res://main.tscn"\n',
    );
    expect(resolveLaunchScene(dir)).toBe(join(dir, 'main.tscn'));
  });

  it('returns null when no scene is configured and none provided', () => {
    const dir = tmp.makeProject('launch-scene-', 'config_version=5\n');
    expect(resolveLaunchScene(dir)).toBeNull();
  });
});

describe('extractSceneScripts', () => {
  it('returns absolute paths for each [ext_resource type="Script"] entry', () => {
    const dir = tmp.makeProject('scene-scripts-', 'config_version=5\n');
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, 'scripts/player.gd'), '');
    writeFileSync(join(dir, 'scripts/enemy.gd'), '');
    const scenePath = join(dir, 'main.tscn');
    writeFileSync(
      scenePath,
      [
        '[gd_scene format=3]',
        '',
        '[ext_resource type="Script" path="res://scripts/player.gd" id="1_aaa"]',
        '[ext_resource type="Script" uid="uid://abc" path="res://scripts/enemy.gd" id="2_bbb"]',
        '[ext_resource type="PackedScene" path="res://scenes/other.tscn" id="3_ccc"]',
        '[ext_resource type="Texture2D" path="res://textures/x.png" id="4_ddd"]',
        '',
        '[node name="Main" type="Node2D"]',
        '',
      ].join('\n'),
    );
    expect(extractSceneScripts(scenePath, dir)).toEqual([
      join(dir, 'scripts/player.gd'),
      join(dir, 'scripts/enemy.gd'),
    ]);
  });

  it('returns [] when the scene file is missing', () => {
    const dir = tmp.makeProject('scene-scripts-', 'config_version=5\n');
    expect(extractSceneScripts(join(dir, 'missing.tscn'), dir)).toEqual([]);
  });

  it('returns [] when the scene has no Script ext_resources', () => {
    const dir = tmp.makeProject('scene-scripts-', 'config_version=5\n');
    const scenePath = join(dir, 'main.tscn');
    writeFileSync(scenePath, '[gd_scene format=3]\n\n[node name="Main" type="Node2D"]\n');
    expect(extractSceneScripts(scenePath, dir)).toEqual([]);
  });

  it('skips entries whose path does not end in .gd', () => {
    const dir = tmp.makeProject('scene-scripts-', 'config_version=5\n');
    const scenePath = join(dir, 'main.tscn');
    writeFileSync(
      scenePath,
      '[ext_resource type="Script" path="res://scripts/bad.cs" id="1_aaa"]\n',
    );
    expect(extractSceneScripts(scenePath, dir)).toEqual([]);
  });
});
