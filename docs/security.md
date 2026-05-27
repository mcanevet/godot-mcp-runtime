# Security Model: `run_script` and `run_project`

GDScript executed via `run_script` runs inside the live Godot process with full user privileges. `run_project` launches the configured main scene and all `[autoload]` scripts, which is equally arbitrary code. Treat both as user-level RCE primitives.

This server's defense is a **three-tier static-analysis gate** that inspects GDScript before it reaches the bridge. The gate is the only real boundary — MCP client bypass-permissions modes (Claude Code `--dangerously-skip-permissions`, Cursor YOLO, etc.) auto-answer elicitation requests, so elicitation alone is a UX speed bump, not a hard boundary. Strict mode (`GODOT_MCP_STRICT=true`) exists so operators running unattended can opt into hard enforcement for everything elicitation would otherwise gate.

The rule catalogue below is the auditable surface. Tier assignments were calibrated against nine real Godot projects under `D:/Godot/Projects` — `OS.execute` and family have zero hits in real game code; literal `load()` / `preload()` / `call()` appear in nearly every game script and were demoted to Tier 3 to avoid conditioning users to click "yes" reflexively.

---

## Tier 1 — Hard block

The server rejects the call. The bridge never sees the script (or the project never launches, for strict-mode `run_project` with Tier 1 autoload findings). No client cooperation required.

### Direct exec

| Primitive                | Rule ID                                    |
| ------------------------ | ------------------------------------------ |
| `OS.execute`             | `tier1.direct_exec.OS.execute`             |
| `OS.create_process`      | `tier1.direct_exec.OS.create_process`      |
| `OS.execute_with_pipe`   | `tier1.direct_exec.OS.execute_with_pipe`   |
| `OS.shell_open`          | `tier1.direct_exec.OS.shell_open`          |
| `OS.kill`                | `tier1.direct_exec.OS.kill`                |
| `OS.set_environment`     | `tier1.direct_exec.OS.set_environment`     |
| `OS.unset_environment`   | `tier1.direct_exec.OS.unset_environment`   |
| `OS.set_restart_on_exit` | `tier1.direct_exec.OS.set_restart_on_exit` |

### Resource-pack persistence

| Primitive                            | Rule ID                           |
| ------------------------------------ | --------------------------------- |
| `ProjectSettings.load_resource_pack` | `tier1.resource_pack.load`        |
| `ProjectSettings.save`               | `tier1.resource_pack.save`        |
| `ProjectSettings.save_custom`        | `tier1.resource_pack.save_custom` |

### Engine tampering

| Primitive                         | Rule ID                                 |
| --------------------------------- | --------------------------------------- |
| `Engine.get_singleton`            | `tier1.engine.get_singleton`            |
| `Engine.register_singleton`       | `tier1.engine.register_singleton`       |
| `Engine.register_script_language` | `tier1.engine.register_script_language` |

### Reflection bypasses

| Primitive                   | Rule ID                                      |
| --------------------------- | -------------------------------------------- |
| `ClassDB.instantiate`       | `tier1.reflection.ClassDB.instantiate`       |
| `ClassDB.class_call_static` | `tier1.reflection.ClassDB.class_call_static` |
| `Object.set_script`         | `tier1.reflection.Object.set_script`         |
| `Node.set_script`           | `tier1.reflection.Node.set_script`           |

### Dynamic code & deserialization

| Primitive                          | Rule ID                                   |
| ---------------------------------- | ----------------------------------------- |
| `Expression` type reference        | `tier1.dynamic.Expression`                |
| `str_to_var` (bare)                | `tier1.dynamic.str_to_var`                |
| `bytes_to_var_with_objects` (bare) | `tier1.dynamic.bytes_to_var_with_objects` |
| `ConfigFile.load`                  | `tier1.config.ConfigFile.load`            |
| `ConfigFile.load_encrypted`        | `tier1.config.ConfigFile.load_encrypted`  |
| `ConfigFile.parse`                 | `tier1.config.ConfigFile.parse`           |

### Non-literal indirection

These primitives fire **only when the first argument is not a literal string**. A literal-path `load("res://main.tscn")` drops to Tier 3 (warn).

| Primitive                          | Rule ID                                         |
| ---------------------------------- | ----------------------------------------------- |
| `load(non_literal)`                | `tier1.indirect.load.nonliteral`                |
| `preload(non_literal)`             | `tier1.indirect.preload.nonliteral`             |
| `ResourceLoader.load(non_literal)` | `tier1.indirect.ResourceLoader.load.nonliteral` |
| `Object.call(non_literal, …)`      | `tier1.indirect.Object.call.nonliteral`         |
| `Object.callv(non_literal, …)`     | `tier1.indirect.Object.callv.nonliteral`        |

---

## Tier 2 — Elicit

The server pauses and sends an `elicitation/create` request to the client. User accept proceeds; decline returns an error naming the primitive. Elicitation failure (older SDK or unsupported client) falls back to a hard denial with a clear error.

**In strict mode (`GODOT_MCP_STRICT=true`), every Tier 2 finding is promoted to Tier 1.**

### Filesystem writes

| Primitive                    | Rule ID                              |
| ---------------------------- | ------------------------------------ |
| `FileAccess.open` (any mode) | `tier2.fs.FileAccess.open`           |
| `DirAccess.remove`           | `tier2.fs.DirAccess.remove`          |
| `DirAccess.remove_absolute`  | `tier2.fs.DirAccess.remove_absolute` |
| `DirAccess.copy`             | `tier2.fs.DirAccess.copy`            |
| `DirAccess.rename`           | `tier2.fs.DirAccess.rename`          |
| `DirAccess.create_link`      | `tier2.fs.DirAccess.create_link`     |

`FileAccess.open` is conservatively flagged uniformly. The READ vs WRITE distinction lives in the second argument; we accept the false-positive cost on read-only opens to keep the rule simple. Confirm "READ mode" and accept the elicitation if your script is reading.

### Network

| Primitive                       | Rule ID                                   |
| ------------------------------- | ----------------------------------------- |
| `HTTPRequest`                   | `tier2.net.HTTPRequest`                   |
| `HTTPClient`                    | `tier2.net.HTTPClient`                    |
| `TCPServer`                     | `tier2.net.TCPServer`                     |
| `StreamPeerTCP`                 | `tier2.net.StreamPeerTCP`                 |
| `WebSocketPeer`                 | `tier2.net.WebSocketPeer`                 |
| `PacketPeerUDP`                 | `tier2.net.PacketPeerUDP`                 |
| `UDPServer`                     | `tier2.net.UDPServer`                     |
| `StreamPeerTLS`                 | `tier2.net.StreamPeerTLS`                 |
| `IP.resolve_hostname`           | `tier2.net.IP.resolve_hostname`           |
| `IP.resolve_hostname_addresses` | `tier2.net.IP.resolve_hostname_addresses` |

---

## Tier 3 — Warn

Executes. Matched rules attach to a `warnings: string[]` array on the success response.

| Primitive                                  | Rule ID                             |
| ------------------------------------------ | ----------------------------------- |
| `load("res://…")` (literal)                | `tier3.literal.load`                |
| `preload("res://…")` (literal)             | `tier3.literal.preload`             |
| `ResourceLoader.load("res://…")` (literal) | `tier3.literal.ResourceLoader.load` |
| `Object.call("method_name", …)` (literal)  | `tier3.literal.Object.call`         |
| `OS.alert`                                 | `tier3.os_alert`                    |

Literal `load`/`preload`/`call` are extremely common in real game scripts; gating them in Tier 2 would condition users to click "yes" reflexively. The warn surface keeps the audit trail without blocking the idiom.

---

## Strict mode

`GODOT_MCP_STRICT=true` is read once at process start. When enabled:

- Every Tier 2 match becomes Tier 1 (hard reject). No elicitation prompt is sent.
- `run_project` becomes a hard reject if any autoload script or the launched scene's attached scripts contain a Tier 1 primitive.

Default (`GODOT_MCP_STRICT` unset or `"false"`): existing behavior preserved on upgrade.

---

## `run_project` pre-flight

`run_project` runs the same scanner over:

1. Every `[autoload]` entry in `project.godot` whose path ends in `.gd`.
2. Every `[ext_resource type="Script" path="res://…"]` attached to the launched scene. The launched scene is the explicit `scene` argument if provided, else `run/main_scene` from `[application]`, else null (no scene scan, autoload-only).

Findings are aggregated and:

- **Default mode**: surfaced as `warnings: string[]` on the success response. The project still launches.
- **Strict mode**: any Tier 1 finding hard-rejects before launch.

Subscene recursion (scanning scripts attached to PackedScenes referenced by the launched scene) is **out of scope for v1**. The autoload scan (always-on) covers the higher-leverage attack surface, since autoloads execute on every launch regardless of scene composition.

### Session-confirmation gate

The first `run_project` call against a given `projectPath` in a session prompts one elicitation: "Launching a Godot project executes arbitrary code in its autoloads and main scene. Proceed?" Subsequent calls in the same session against the same project skip.

---

## Audit trail

Every `run_script` call writes two files to `.mcp/scripts/`:

- `{timestamp}-{uuid}.gd` — the raw script source.
- `{timestamp}-{uuid}.policy.json` — the policy decision:

```json
{
  "decision": "hard_block" | "elicit_denied" | "warn" | "ok",
  "tier": 1,
  "strict_mode": false,
  "promoted_by_strict": false,
  "findings": [
    {
      "rule": "tier1.direct_exec.OS.execute",
      "line": 7,
      "column": 5,
      "matched_text": "OS.execute"
    }
  ],
  "timestamp": "2026-05-27T..."
}
```

Audit failure (disk full, permission denied) is logged via `logDebug` and never blocks the call.

`run_project` does NOT emit per-call sidecars — findings flow into the response `warnings` array only.

---

## What this does NOT do

- No runtime sandbox. The gate is static-analysis only.
- No GDScript AST parse. The tokenizer is line-oriented and does not track variable assignments.
- No defense against scripts that pass the gate then construct dangerous patterns dynamically through means the tokenizer cannot catch — mitigated by `Expression`, `Engine.get_singleton`, and non-literal dynamic dispatch all being Tier 1.
- No telemetry / centralized reporting of blocks.
- No per-project or per-user policy overrides beyond `GODOT_MCP_STRICT`.
- No retroactive scanning of scripts already in the project — `run_project` scans autoloads + launched scene's top-level scripts only.
- `attach_project` inherits whatever the externally launched Godot is doing. Scripts executed via `run_script` against an attached process still go through the gate.
