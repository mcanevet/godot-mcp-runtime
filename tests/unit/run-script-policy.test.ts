/**
 * Policy evaluator tests. Verifies tier assignment, argument-shape checks,
 * strict-mode promotion, and that comments / strings don't false-positive.
 */

import { describe, it, expect } from 'vitest';
import { evaluateScript } from '../../src/utils/run-script-policy.js';

const VALID_PREFIX = 'extends RefCounted\nfunc execute(scene_tree):\n\t';

function evalLine(line: string): ReturnType<typeof evaluateScript> {
  return evaluateScript(VALID_PREFIX + line + '\n');
}

describe('evaluateScript — Tier 1 hard_block', () => {
  it('blocks OS.execute(...)', () => {
    const d = evalLine('OS.execute("rm", ["-rf", "/"])');
    expect(d.decision).toBe('hard_block');
    expect(d.effectiveTier).toBe(1);
    expect(d.matches.some((m) => m.ruleId === 'tier1.direct_exec.OS.execute')).toBe(true);
  });

  it('blocks OS.create_process(...)', () => {
    expect(evalLine('OS.create_process("/bin/sh", [])').decision).toBe('hard_block');
  });

  it('blocks OS.shell_open(url)', () => {
    expect(evalLine('OS.shell_open("https://evil.example")').decision).toBe('hard_block');
  });

  it('blocks ProjectSettings.load_resource_pack(...)', () => {
    expect(evalLine('ProjectSettings.load_resource_pack("res://x.pck")').decision).toBe(
      'hard_block',
    );
  });

  it('blocks Engine.get_singleton(...)', () => {
    expect(evalLine('Engine.get_singleton("Foo")').decision).toBe('hard_block');
  });

  it('blocks ClassDB.instantiate(...)', () => {
    expect(evalLine('ClassDB.instantiate("OS")').decision).toBe('hard_block');
  });

  it('blocks set_script via Object.set_script', () => {
    expect(evalLine('Object.set_script(some_node, my_script)').decision).toBe('hard_block');
  });

  it('blocks Expression usage', () => {
    expect(evalLine('var e = Expression.new()').decision).toBe('hard_block');
  });

  it('blocks str_to_var as a bare identifier', () => {
    expect(evalLine('var v = str_to_var(data)').decision).toBe('hard_block');
  });

  it('blocks load() with a non-literal first argument', () => {
    const d = evalLine('var r = load(path_var)');
    expect(d.decision).toBe('hard_block');
    expect(d.matches.some((m) => m.ruleId === 'tier1.indirect.load.nonliteral')).toBe(true);
  });

  it('blocks ResourceLoader.load with non-literal first arg', () => {
    expect(evalLine('var r = ResourceLoader.load(var_path)').decision).toBe('hard_block');
  });

  it('does NOT block load() with a literal string (Tier 3 warn instead)', () => {
    const d = evalLine('var r = load("res://foo.tscn")');
    expect(d.decision).toBe('warn');
    expect(d.matches.some((m) => m.ruleId === 'tier3.literal.load')).toBe(true);
  });

  it('does NOT block preload() with a literal string', () => {
    const d = evalLine('var r = preload("res://foo.gd")');
    expect(d.decision).toBe('warn');
  });
});

describe('evaluateScript — Tier 2 elicit_required', () => {
  it('elicits on FileAccess.open(...)', () => {
    const d = evalLine('var f = FileAccess.open("res://x.txt", FileAccess.WRITE)');
    expect(d.decision).toBe('elicit_required');
    expect(d.effectiveTier).toBe(2);
  });

  it('elicits on HTTPRequest type reference', () => {
    expect(evalLine('var h = HTTPRequest.new()').decision).toBe('elicit_required');
  });

  it('elicits on TCPServer', () => {
    expect(evalLine('var s = TCPServer.new()').decision).toBe('elicit_required');
  });

  it('elicits on DirAccess.remove(...)', () => {
    expect(evalLine('DirAccess.remove("/x")').decision).toBe('elicit_required');
  });

  it('elicits on IP.resolve_hostname', () => {
    expect(evalLine('IP.resolve_hostname("example.com")').decision).toBe('elicit_required');
  });
});

describe('evaluateScript — Tier 3 warn', () => {
  it('warns on literal load() but executes', () => {
    const d = evalLine('var r = load("res://main.tscn")');
    expect(d.decision).toBe('warn');
    expect(d.effectiveTier).toBe(3);
  });

  it('warns on OS.alert', () => {
    expect(evalLine('OS.alert("hi")').decision).toBe('warn');
  });
});

describe('evaluateScript — clean scripts', () => {
  it('returns ok for a script that touches only scene_tree', () => {
    const d = evaluateScript(
      'extends RefCounted\nfunc execute(scene_tree):\n\treturn scene_tree.get_root().get_child_count()\n',
    );
    expect(d.decision).toBe('ok');
    expect(d.effectiveTier).toBeNull();
    expect(d.matches).toHaveLength(0);
  });

  it('ignores dangerous identifiers in comments', () => {
    const d = evaluateScript(
      'extends RefCounted\nfunc execute(scene_tree):\n\t# OS.execute is dangerous, do not use\n\treturn 1\n',
    );
    expect(d.decision).toBe('ok');
  });

  it('ignores dangerous identifiers in string literals', () => {
    const d = evaluateScript(
      'extends RefCounted\nfunc execute(scene_tree):\n\tvar msg = "OS.execute is blocked"\n\treturn msg\n',
    );
    expect(d.decision).toBe('ok');
  });

  it('ignores dangerous identifiers in triple-quoted docstrings', () => {
    const source = [
      'extends RefCounted',
      'func execute(scene_tree):',
      '\tvar doc = """',
      '\tDo not call OS.execute or HTTPRequest.new() here.',
      '\t"""',
      '\treturn doc',
      '',
    ].join('\n');
    expect(evaluateScript(source).decision).toBe('ok');
  });
});

describe('evaluateScript — strict mode promotion', () => {
  it('promotes Tier 2 to Tier 1 when strict:true', () => {
    const source = VALID_PREFIX + 'var h = HTTPRequest.new()\n';
    const lax = evaluateScript(source, { strict: false });
    const strict = evaluateScript(source, { strict: true });
    expect(lax.decision).toBe('elicit_required');
    expect(lax.promotedByStrict).toBe(false);
    expect(strict.decision).toBe('hard_block');
    expect(strict.effectiveTier).toBe(1);
    expect(strict.promotedByStrict).toBe(true);
  });

  it('does NOT promote Tier 3 in strict mode', () => {
    const source = VALID_PREFIX + 'var r = load("res://foo.tscn")\n';
    const strict = evaluateScript(source, { strict: true });
    expect(strict.decision).toBe('warn');
    expect(strict.promotedByStrict).toBe(false);
  });

  it('promotes only the matching Tier 2 finding; pre-existing Tier 1 stays Tier 1', () => {
    const source = VALID_PREFIX + 'OS.execute("evil")\n' + '\tvar h = HTTPRequest.new()\n';
    const strict = evaluateScript(source, { strict: true });
    expect(strict.decision).toBe('hard_block');
    expect(strict.effectiveTier).toBe(1);
    expect(strict.promotedByStrict).toBe(true);
    // Both should have been recorded.
    expect(strict.matches.some((m) => m.ruleId.startsWith('tier1.direct_exec'))).toBe(true);
    expect(strict.matches.some((m) => m.ruleId.startsWith('tier2.net'))).toBe(true);
  });
});

describe('evaluateScript — highest tier wins', () => {
  it('reports hard_block when Tier 1 and Tier 2 both fire', () => {
    const source =
      VALID_PREFIX + 'OS.execute("x")\n' + '\tvar h = HTTPRequest.new()\n' + '\treturn 1\n';
    const d = evaluateScript(source);
    expect(d.decision).toBe('hard_block');
    expect(d.effectiveTier).toBe(1);
  });

  it('reports elicit_required when only Tier 2 and Tier 3 fire', () => {
    const source =
      VALID_PREFIX + 'var r = load("res://x.tscn")\n' + '\tvar h = HTTPRequest.new()\n';
    expect(evaluateScript(source).decision).toBe('elicit_required');
  });
});

describe('evaluateScript — finding line numbers', () => {
  it('records the line number of each match', () => {
    const source =
      'extends RefCounted\n' +
      'func execute(scene_tree):\n' +
      '\tvar a = 1\n' +
      '\tOS.execute("x")\n' +
      '\treturn a\n';
    const d = evaluateScript(source);
    expect(d.matches[0]?.line).toBe(4);
  });
});
