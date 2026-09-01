import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const spawnMock = vi.fn();
const findFreePortMock = vi.fn(async () => 12345);
const injectMock = vi.fn();
const cleanupMock = vi.fn();

vi.mock('child_process', () => ({ spawn: (...args: unknown[]) => spawnMock(...args) }));
vi.mock('./bridge-protocol.js', async () => {
  const actual = await vi.importActual('./bridge-protocol.js');
  return { ...actual, findFreePort: findFreePortMock };
});
vi.mock('./path-validation.js', async () => {
  const actual = await vi.importActual('./path-validation.js');
  return { ...actual, checkDisplayAvailable: () => true, validateSubPath: () => false };
});
vi.mock('./bridge-manager.js', () => ({
  BridgeManager: class {
    inject = injectMock;
    cleanup = cleanupMock;
    getLastInjectedPort = () => 12345;
  },
}));

import { GodotRunner } from '../../src/utils/godot-runner.js';

function fakeSpawnedProcess() {
  return {
    pid: 4242,
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn(),
    kill: vi.fn(),
  };
}

describe('runProject relative projectPath regression', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'gmr-rel-path-'));
    writeFileSync(join(projectDir, 'project.godot'), '[application]');
    spawnMock.mockReset().mockReturnValue(fakeSpawnedProcess());
    injectMock.mockReset();
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  it('stores the absolute path so pollBridge can match the bridge-reported project_path', async () => {
    // Regression: with a relative path ('.'), waitForBridge's path guard
    // compared the bridge-reported absolute project_path against '.' and
    // failed instantly — misreported as a generic 8s bridge timeout.
    const cwdSave = process.cwd();
    process.chdir(projectDir);
    try {
      const runner = new GodotRunner({ godotPath: process.execPath });
      await runner.runProject('.', undefined, true);
      expect(runner.activeProjectPath).toBe(resolve('.'));
      // spawn argv carries the resolved path — Godot loads the project from it
      const spawnArgs = spawnMock.mock.calls[0] as unknown[];
      expect(spawnArgs[1]).toContain('--path');
      expect(spawnArgs[1]).toContain(resolve('.'));
    } finally {
      process.chdir(cwdSave);
    }
  });

  it('keeps absolute paths unchanged', async () => {
    const runner = new GodotRunner({ godotPath: process.execPath });
    await runner.runProject(projectDir, undefined, true);
    expect(runner.activeProjectPath).toBe(resolve(projectDir));
    const spawnArgs = spawnMock.mock.calls[0] as unknown[];
    expect(spawnArgs[1]).toContain(resolve(projectDir));
  });
});
