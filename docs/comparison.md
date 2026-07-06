# Godot MCP Servers with Runtime Support, Compared

There are now more than a dozen Model Context Protocol servers for Godot, and picking one is harder than it should be, because the marketing collapses two very different capabilities into the single word "runtime." This page separates them and lays out where every actively-maintained server sits, with sources for each claim. It's maintained by the author of [godot-mcp-runtime](https://github.com/Erodenn/godot-mcp-runtime), so read the verdicts with that in mind, but the table is built from each project's own repo and docs and corrections are welcome via [issue](https://github.com/Erodenn/godot-mcp-runtime/issues).

Last updated July 2026.

## The two axes that actually matter

Most comparisons rank Godot MCP servers on one axis: can the AI just edit files, or can it drive a running game? That axis is real. A file-level server reads and writes your `.tscn` and `.gd` files as text and hands the result back, and it never sees the game run. A runtime server can press play, read what happened, and correct itself from the actual error. The distinction matters, and the field has largely caught up to it: several servers now ship some form of runtime bridge.

The axis the marketing skips is footprint. A server that drives your running game has to get code into that game somehow, and there are three ways to do it:

- **Committed addon.** You copy a plugin or an autoload script into your project, register it, and commit it to version control. It's now a dependency you maintain, and it ships in your repo.
- **Custom engine.** You download and run a modified engine binary instead of stock Godot, and the runtime lives inside that engine.
- **Zero footprint.** The server injects a bridge transiently when it launches the game and removes it on shutdown. Nothing is committed, nothing is installed into the project, and you keep running stock Godot.

Full live-game control and a zero-footprint install rarely come together, which is the gap godot-mcp-runtime was built to fill.

## The field

| Server                                                                           | Live-game runtime                                          | How it connects                                  | Footprint                        | Stock Godot | License                             | Price                 | Stars | Last activity |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ | -------------------------------- | ----------- | ----------------------------------- | --------------------- | ----- | ------------- |
| [godot-mcp-runtime](https://github.com/Erodenn/godot-mcp-runtime)                | **Full**: screenshots, input, live scene tree, script exec | Injected TCP bridge autoload, auto-cleanup       | **Zero** (`npx`)                 | Yes         | MIT                                 | Free                  | 42    | 2026-07-06    |
| [Summer Engine](https://www.summerengine.com/mcp)                                | Full                                                       | Runs against a custom engine on `localhost:6550` | Custom engine download + sign-in | No          | MIT agent layer; proprietary engine | Free core, paid cloud | 21    | 2026-07-04    |
| [tugcantopaloglu/godot-mcp](https://github.com/tugcantopaloglu/godot-mcp)        | Full                                                       | TCP autoload on `:9090`                          | Committed addon (autoload)       | Yes         | MIT                                 | Free                  | 316   | 2026-03-07    |
| [Godot MCP Pro](https://godotengine.org/asset-library/asset/4961)                | Full                                                       | WebSocket editor plugin on `:6505`               | Committed addon (editor plugin)  | Yes         | Proprietary                         | $15 one-time          | 473   | 2026-06-24    |
| [IvanMurzak/Godot-MCP](https://github.com/IvanMurzak/Godot-MCP)                  | Full (runtime errors opt-in)                               | C# addon over SignalR                            | Committed addon (C#, .NET only)  | Yes (mono)  | Apache-2.0                          | Free                  | 163   | 2026-06-30    |
| [GDAI MCP](https://gdaimcp.com)                                                  | Editor-mediated                                            | Paid editor plugin drives the editor             | Committed addon (paid)           | Yes         | Proprietary                         | $19 one-time          | 92    | 2026-03-30    |
| [Coding-Solo/godot-mcp](https://github.com/Coding-Solo/godot-mcp)                | No (launch + debug output only)                            | Headless ops, launches the editor                | Zero (`npx`)                     | Yes         | MIT                                 | Free                  | 4,578 | 2026-04-16    |
| [n24q02m/better-godot-mcp](https://github.com/n24q02m/better-godot-mcp)          | No (file/editor level)                                     | `.tscn` text parsing                             | Zero (`npx`/Docker)              | Yes         | MIT                                 | Free                  | 27    | 2026-07-05    |
| [godot-dap-mcp-server](https://github.com/TransitionMatrix/godot-dap-mcp-server) | Debugger only                                              | Godot's built-in Debug Adapter Protocol          | Zero (Go binary)                 | Yes         | MIT                                 | Free                  | 4     | 2025-12-05    |
| [Dokujaa/Godot-MCP](https://github.com/Dokujaa/Godot-MCP)                        | No (editor only)                                           | Editor plugin + Python server                    | Committed addon                  | Yes         | Unspecified                         | Free                  | 50    | 2026-07-02    |

"Live-game runtime" means the server can interact with the game while it runs: capture the viewport, simulate input into it, read or edit the live scene tree, and execute code against it. "Editor-mediated" means the runtime goes through the Godot editor rather than the running game directly. "Stars" and "Last activity" are from each GitHub repo or asset-library page as of July 2026, and star counts track age and reach more than capability: Coding-Solo has the largest following and no live-game runtime at all.

## Where each one fits

**godot-mcp-runtime** is the server this page is written from, so here is the honest scope. It pairs headless editing (scenes, nodes, scripts, signals, validation) with a runtime bridge that does screenshots, input simulation, UI discovery, and live GDScript against the running scene tree. The bridge is an autoload injected when you call `run_project` or `attach_project` and removed on shutdown, so nothing lands in your repo and you keep running stock Godot from `npx`. It has shipped a runtime bridge since its first public release in February 2026, when it was the only server doing live-game control this way. It is not a hosted service and it generates no assets. Think of it as [Playwright MCP](https://github.com/microsoft/playwright-mcp), but for Godot.

**Summer Engine** is the most capable runtime environment in the list, and it is not stock Godot. You download a customized Godot-based engine of roughly a gigabyte, sign in, and the MCP server talks to that engine on `localhost:6550`. The agent layer is MIT open source; the engine binary is proprietary and free to download, and the hosted AI, asset generation, and multiplayer features are paid. If you want an all-in-one AI game environment and you are willing to adopt a non-stock engine and an account, it is the deepest option. If you want to keep your existing stock-Godot project untouched, it is the wrong shape.

**tugcantopaloglu/godot-mcp** is the closest peer on raw runtime capability against stock Godot: 149 self-reported tools, a TCP autoload on port 9090, live GDScript eval with `await` support, and runtime error capture. The tradeoff is footprint. Its runtime half only works once you copy `mcp_interaction_server.gd` into your project and register it as an autoload, so the bridge is a committed dependency rather than a transient injection.

**Godot MCP Pro** is a polished commercial option at $15 one-time, with a large tool count and record-and-replay input. It runs as an editor-plugin addon over a WebSocket, so, like the other addon servers, the plugin lives in your project, and the source is closed.

**IvanMurzak/Godot-MCP** is a strong Apache-2.0 option if you are on the C#/.NET (mono) edition of Godot. It installs as a C# addon, talks over SignalR, and can even run inside an exported game build, with runtime error capture available as an opt-in you enable explicitly. It is addon-based and C#-only, so it does not fit GDScript-only or zero-footprint setups.

**GDAI MCP** is a paid editor plugin ($19 one-time) that drives the Godot editor and can screenshot the running game and read the debugger. Input simulation is advertised on the site but not documented in the repo, and the repo carries no open-source license, so treat it as proprietary. Its runtime is editor-mediated rather than a direct bridge into the running game.

**Coding-Solo/godot-mcp** is the most-starred server in the space and the foundation godot-mcp-runtime's headless operations were built on. It is a clean, MIT, zero-footprint `npx` server that launches the editor, runs projects, and captures debug output. What it does not do is interact with the running game: no live screenshots, no input simulation, no scripting against the live scene tree. If you want file-level editing and process control with a minimal, auditable codebase, it is the reference implementation.

**better-godot-mcp** is a zero-footprint MIT server with 17 composite tools that works by parsing `.tscn` text and can shell out to run the project, but it has no runtime bridge, so it is file and editor level only.

**godot-dap-mcp-server** is the interesting edge case for the footprint axis: it is genuinely zero-footprint runtime, because it connects to Godot's built-in Debug Adapter Protocol rather than installing anything. But DAP is a debugger, so it gives you breakpoints, stepping, stack traces, and variable inspection, not screenshots or input simulation. It answers "why did this line break," not "does the button work when clicked."

**Dokujaa/Godot-MCP** is an editor-plugin server with a Python backend, oriented toward scene generation rather than runtime control, with no live-game interaction documented and no stated license.

## How to choose

Start with the two axes. If you only need the AI to edit files and read the editor's debug output, a file-level server is enough, and Coding-Solo/godot-mcp is the clean MIT reference. If you want the AI to drive the running game and confirm its own work, you need a runtime server, and then footprint decides:

- You run stock Godot and want nothing committed to your repo: **godot-mcp-runtime**, which is the only server that puts full live-game control (screenshots, input, live scene tree, script execution) behind a zero-footprint `npx` install.
- You are already on C#/.NET and want an open, addon-based server: **IvanMurzak/Godot-MCP**.
- You want the most GDScript runtime tools and don't mind committing an autoload: **tugcantopaloglu/godot-mcp**.
- You want a polished commercial editor plugin and will pay for it: **Godot MCP Pro** or **GDAI MCP**.
- You want an all-in-one AI game engine and will adopt a non-stock engine plus an account: **Summer Engine**.
- You only need a runtime debugger, breakpoints and variable inspection, with nothing installed: **godot-dap-mcp-server**.

## Methodology

Every capability claim above comes from the project's own README, docs, site, or asset-library page, and every runtime and footprint classification was checked against those sources in July 2026. Star counts and last-activity dates are from the GitHub API and asset-library pages on the same date. Tool counts (149, 163, and similar) are vendor self-reported and not independently audited. Two projects are closed-source (GDAI MCP, Godot MCP Pro), so their runtime mechanisms are taken from their own documentation rather than inspected code. If something here is wrong or out of date, [open an issue](https://github.com/Erodenn/godot-mcp-runtime/issues) and it will be corrected.
