import type { GodotRunner } from '../utils/godot-runner.js';
import type { HandlerResult, OperationParams } from '../mcp.types.js';
import { type McpContext } from '../utils/mcp-context.js';
export declare const runtimeToolDefinitions: readonly [{
    readonly name: "launch_editor";
    readonly description: "Open the Godot editor GUI for a project for the human user. Use only when the user explicitly asks to \"open the editor\"; for any agent-driven work, use the headless scene/node tools (add_node, set_node_properties, etc.) instead — the editor cannot be controlled programmatically. Returns plain-text confirmation after spawning the editor process. Errors if projectPath has no project.godot.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
        };
        readonly required: readonly ["projectPath"];
    };
}, {
    readonly name: "run_project";
    readonly description: "Spawn a Godot project as a child process with stdout/stderr captured. Required before take_screenshot, simulate_input, get_ui_elements, run_script, or get_debug_output. For a Godot process you launched yourself, use attach_project instead. Verifies MCP bridge readiness before returning success. Returns plain-text status with the assigned bridge port. Call stop_project when done. Errors if projectPath is not a Godot project or another session is already active.";
    readonly annotations: {
        readonly destructiveHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scene: {
                readonly type: "string";
                readonly description: "Scene to run (path relative to project, e.g. \"scenes/main.tscn\"). Omit to use the project's main scene.";
            };
            readonly background: {
                readonly type: "boolean";
                readonly description: "If true, hides the Godot window off-screen and blocks all physical keyboard and mouse input, while keeping programmatic input (simulate_input, run_script) and screenshots fully active. Useful for automated agent-driven testing where the window should not be visible or interactive.";
            };
            readonly bridgePort: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 65535;
                readonly description: "TCP port for the MCP bridge. Omit to auto-select a free port (recommended). The chosen port is baked into the project's `mcp_bridge.gd` at inject time, so the running Godot listens on exactly this port.";
            };
        };
        readonly required: readonly ["projectPath"];
    };
}, {
    readonly name: "attach_project";
    readonly description: "Inject the MCP bridge into a Godot process you launch yourself, then wait up to 15s for the bridge to respond. Call BEFORE Godot launches — Godot reads autoloads only at process start, so a late call returns \"bridge did not respond.\" Recommended pattern: kick off the Godot launch in parallel with this call so the wait absorbs startup. Prefer run_project unless MCP must not spawn Godot. Returns plain-text status with the resolved bridge port. Call detach_project or stop_project when done.";
    readonly annotations: {
        readonly destructiveHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly bridgePort: {
                readonly type: "number";
                readonly minimum: 1;
                readonly maximum: 65535;
                readonly description: "TCP port for the MCP bridge. Omit to auto-select a free port (recommended). The chosen port is baked into the project's `mcp_bridge.gd` at inject time, so the running Godot listens on exactly this port.";
            };
        };
        readonly required: readonly ["projectPath"];
    };
}, {
    readonly name: "detach_project";
    readonly description: "Clear attached-mode runtime state and remove the injected McpBridge autoload. Does NOT stop the manually launched Godot process — that stays running. Use after attach_project when you are done driving the game from MCP. For spawned sessions (run_project), use stop_project instead. Returns: message confirming detach plus externalProcessPreserved (always true here — that is the point of detach vs stop_project). Errors if called outside an attached session.";
    readonly annotations: {
        readonly destructiveHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
        readonly required: readonly [];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly message: {
                readonly type: "string";
            };
            readonly externalProcessPreserved: {
                readonly type: "boolean";
            };
        };
    };
}, {
    readonly name: "get_debug_output";
    readonly description: "Get captured stdout/stderr from a spawned Godot project. Use whenever runtime tools fail unexpectedly — script errors, missing nodes, and crash backtraces all surface here. Requires run_project (not attach_project; attached mode does not capture output). Returns: output/errors (last `limit` lines each, default 200), running (false after exit, null when attached), exitCode after exit, attached:true with empty arrays in attached mode.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly limit: {
                readonly type: "number";
                readonly description: "Max lines to return (default: 200, from end of output)";
            };
        };
        readonly required: readonly [];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly output: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly errors: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly running: {
                readonly type: readonly ["boolean", "null"];
            };
            readonly exitCode: {
                readonly type: readonly ["number", "null"];
            };
            readonly attached: {
                readonly type: "boolean";
            };
            readonly tip: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly name: "stop_project";
    readonly description: "Stop the spawned Godot project and clean up MCP bridge state. Always call when done with runtime testing — even after a crash — to free the single process slot so run_project can be called again. For attached sessions, this detaches without killing the externally launched process. Returns: message, mode (\"spawned\"/\"attached\"), externalProcessPreserved (true only for attached), finalOutput and finalErrors (last 200 lines each). Errors if no session is active.";
    readonly annotations: {
        readonly destructiveHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
        readonly required: readonly [];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly message: {
                readonly type: "string";
            };
            readonly mode: {
                readonly type: "string";
            };
            readonly externalProcessPreserved: {
                readonly type: "boolean";
            };
            readonly finalOutput: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly finalErrors: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    };
}, {
    readonly name: "take_screenshot";
    readonly description: "Capture a PNG of the running viewport. responseMode: preview (default — saves full PNG, returns bounded inline preview at 960x540), full (full inline PNG; use for small text or pixel-level inspection), path_only (saved-path only, no inline image). Saved under .mcp/screenshots. Returns: inline image block (full/preview modes), plus path and size of the saved PNG; previewPath/previewSize in preview mode; warnings for non-fatal runtime errors. Errors if no session or bridge times out (default 10000ms).";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly timeout: {
                readonly type: "number";
                readonly description: "Timeout in milliseconds to wait for the screenshot (default: 10000)";
            };
            readonly responseMode: {
                readonly type: "string";
                readonly enum: readonly ["full", "preview", "path_only"];
                readonly description: "Response payload mode. \"preview\" returns a bounded inline preview plus paths (default). \"full\" returns the full inline PNG. \"path_only\" returns paths only.";
            };
            readonly previewMaxWidth: {
                readonly type: "number";
                readonly description: "Maximum preview width in pixels when responseMode is \"preview\" (default: 960)";
            };
            readonly previewMaxHeight: {
                readonly type: "number";
                readonly description: "Maximum preview height in pixels when responseMode is \"preview\" (default: 540)";
            };
        };
        readonly required: readonly [];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly responseMode: {
                readonly type: "string";
            };
            readonly path: {
                readonly type: "string";
            };
            readonly size: {
                readonly type: "object";
                readonly properties: {
                    readonly width: {
                        readonly type: "number";
                    };
                    readonly height: {
                        readonly type: "number";
                    };
                };
            };
            readonly previewPath: {
                readonly type: "string";
            };
            readonly previewSize: {
                readonly type: "object";
                readonly properties: {
                    readonly width: {
                        readonly type: "number";
                    };
                    readonly height: {
                        readonly type: "number";
                    };
                };
            };
            readonly warnings: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    };
}, {
    readonly name: "simulate_input";
    readonly description: "Simulate sequential input in a running project. Each action's `type` (key, mouse_button, mouse_motion, click_element, action, wait) gates which other fields apply — see per-property docs. For click_element use get_ui_elements first; resolution is by path/name, not visible text. Press/release require two actions; insert wait between for frame ticks. Returns: success, actions_processed, warnings for runtime errors fired by input handlers. Errors if no session or any action fails validation.";
    readonly annotations: {
        readonly destructiveHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly actions: {
                readonly type: "array";
                readonly description: "Array of input actions to execute sequentially. Each object must have a \"type\" field.";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["key", "mouse_button", "mouse_motion", "click_element", "action", "wait"];
                            readonly description: "The type of input action";
                        };
                        readonly key: {
                            readonly type: "string";
                            readonly description: "[key] Godot KEY_* constant name without the prefix (e.g. \"W\", \"Space\", \"Escape\", \"Enter\", \"Tab\", \"Up\", \"PageUp\"). Errors on unrecognized names.";
                        };
                        readonly pressed: {
                            readonly type: "boolean";
                            readonly description: "[key, mouse_button, action] Whether the input is pressed (true) or released (false). For mouse_button: omit to auto-click (press+release in one action); set explicitly only for hold/release. For key: defaults to true and does NOT auto-release — emit a second action with pressed:false to release.";
                        };
                        readonly shift: {
                            readonly type: "boolean";
                            readonly description: "[key] Shift modifier";
                        };
                        readonly ctrl: {
                            readonly type: "boolean";
                            readonly description: "[key] Ctrl modifier";
                        };
                        readonly alt: {
                            readonly type: "boolean";
                            readonly description: "[key] Alt modifier";
                        };
                        readonly unicode: {
                            readonly type: "number";
                            readonly description: "[key] Unicode codepoint for text-entry Controls (LineEdit, TextEdit). Auto-derived for ASCII letters/digits (respecting shift); pass explicitly for symbols or non-ASCII. E.g. 33 for \"!\", 64 for \"@\".";
                        };
                        readonly button: {
                            readonly type: "string";
                            readonly enum: readonly ["left", "right", "middle"];
                            readonly description: "[mouse_button, click_element] Mouse button (default: left)";
                        };
                        readonly x: {
                            readonly type: "number";
                            readonly description: "[mouse_button, mouse_motion] X position in viewport pixels (0,0 = top-left)";
                        };
                        readonly y: {
                            readonly type: "number";
                            readonly description: "[mouse_button, mouse_motion] Y position in viewport pixels (0,0 = top-left)";
                        };
                        readonly relative_x: {
                            readonly type: "number";
                            readonly description: "[mouse_motion] Relative X movement in pixels";
                        };
                        readonly relative_y: {
                            readonly type: "number";
                            readonly description: "[mouse_motion] Relative Y movement in pixels";
                        };
                        readonly double_click: {
                            readonly type: "boolean";
                            readonly description: "[mouse_button, click_element] Double click";
                        };
                        readonly element: {
                            readonly type: "string";
                            readonly description: "[click_element] Identifies the UI element to click. Accepts: absolute node path (e.g. \"/root/HUD/Button\"), relative node path, or node name (BFS matched). Use get_ui_elements to discover valid names and paths.";
                        };
                        readonly action: {
                            readonly type: "string";
                            readonly description: "[action] Godot input action name (as defined in Project Settings > Input Map)";
                        };
                        readonly strength: {
                            readonly type: "number";
                            readonly description: "[action] Action strength (0–1, default 1.0)";
                        };
                        readonly ms: {
                            readonly type: "number";
                            readonly description: "[wait] Duration in milliseconds to pause before the next action (~16ms = one frame at 60fps).";
                        };
                    };
                    readonly required: readonly ["type"];
                };
            };
        };
        readonly required: readonly ["actions"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly success: {
                readonly type: "boolean";
            };
            readonly actions_processed: {
                readonly type: "number";
            };
            readonly warnings: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tip: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly name: "get_ui_elements";
    readonly description: "Walk the running scene tree and return all Control nodes with positions, sizes, types, and text content. Always call this before simulate_input click_element actions to discover valid element names and paths. Requires an active runtime session (run_project or attach_project). visibleOnly defaults true; pass false to include hidden Controls. filter narrows by class. Returns: elements[] with path/type/rect/visible plus optional text/disabled/tooltip.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly visibleOnly: {
                readonly type: "boolean";
                readonly description: "Only return nodes where Control.visible is true (default: true). Set false to include hidden elements.";
            };
            readonly filter: {
                readonly type: "string";
                readonly description: "Filter by Control node type (e.g. \"Button\", \"Label\", \"LineEdit\")";
            };
        };
        readonly required: readonly [];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly elements: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                        };
                        readonly path: {
                            readonly type: "string";
                        };
                        readonly type: {
                            readonly type: "string";
                        };
                        readonly rect: {
                            readonly type: "object";
                            readonly properties: {
                                readonly x: {
                                    readonly type: "number";
                                };
                                readonly y: {
                                    readonly type: "number";
                                };
                                readonly width: {
                                    readonly type: "number";
                                };
                                readonly height: {
                                    readonly type: "number";
                                };
                            };
                        };
                        readonly visible: {
                            readonly type: "boolean";
                        };
                        readonly text: {
                            readonly type: "string";
                        };
                        readonly placeholder: {
                            readonly type: "string";
                        };
                        readonly disabled: {
                            readonly type: "boolean";
                        };
                        readonly tooltip: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly warnings: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tip: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly name: "run_script";
    readonly description: "Execute a custom GDScript in the live running project with full scene tree access. Requires an active runtime session. Script must extend RefCounted and define func execute(scene_tree: SceneTree) -> Variant. Return values are JSON-serialized (primitives, Vector2/3, Color, Dictionary, Array, and Node path strings). Use print() for debug output — it appears in get_debug_output, not in the result. In spawned mode, stderr runtime errors escalate to errors (when the script returns null) or surface as warnings. Returns: { success, result, warnings?, tip? } where result is the JSON-serialized return value of execute().";
    readonly annotations: {
        readonly destructiveHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly script: {
                readonly type: "string";
                readonly description: "GDScript source code. Must contain \"extends RefCounted\" and \"func execute(scene_tree: SceneTree) -> Variant\".";
            };
            readonly timeout: {
                readonly type: "number";
                readonly description: "Timeout in ms (default: 30000). Increase for long-running scripts.";
            };
        };
        readonly required: readonly ["script"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly success: {
                readonly type: "boolean";
            };
            readonly result: {};
            readonly warnings: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tip: {
                readonly type: "string";
            };
        };
    };
}];
export declare function handleLaunchEditor(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleRunProject(runner: GodotRunner, args: OperationParams, ctx?: McpContext): Promise<HandlerResult>;
export declare function handleAttachProject(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleDetachProject(runner: GodotRunner): Promise<HandlerResult>;
export declare function handleGetDebugOutput(runner: GodotRunner, args?: OperationParams): HandlerResult;
export declare function handleStopProject(runner: GodotRunner): Promise<HandlerResult>;
export declare function handleTakeScreenshot(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleSimulateInput(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleGetUiElements(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleRunScript(runner: GodotRunner, args: OperationParams, ctx?: McpContext): Promise<HandlerResult>;
//# sourceMappingURL=runtime-tools.d.ts.map