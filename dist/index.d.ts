#!/usr/bin/env node
/**
 * Godot MCP Server
 *
 * This MCP server provides tools for interacting with the Godot game engine.
 * It enables AI assistants to launch the Godot editor, run Godot projects,
 * capture debug output, manipulate scenes and nodes, and more.
 */
export declare const allToolDefinitions: ({
    readonly name: "list_autoloads";
    readonly description: "List all registered autoloads in a project with paths and singleton status. Use first when diagnosing headless failures — broken autoloads crash all headless ops, so this tells you what is loaded. No Godot process required (reads project.godot directly). Returns: [{ name, path, singleton }].";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
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
} | {
    readonly name: "add_autoload";
    readonly description: "Register a new autoload in a project. autoloadPath accepts \"res://...\" or a project-relative path (auto-prefixed). singleton defaults true (accessible globally by name). No Godot process required. Warning: autoloads initialize in headless mode — a broken script will crash every subsequent headless op; validate before adding. Returns plain-text confirmation with the registered name, path, and singleton flag. Errors if an autoload with the same name already exists; use update_autoload to modify.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly autoloadName: {
                readonly type: "string";
                readonly description: "Name of the autoload node (e.g. \"MyManager\")";
            };
            readonly autoloadPath: {
                readonly type: "string";
                readonly description: "Path to the script or scene (e.g. \"res://autoload/my_manager.gd\" or \"autoload/my_manager.gd\")";
            };
            readonly singleton: {
                readonly type: "boolean";
                readonly description: "Register as a globally accessible singleton by name (default: true)";
            };
        };
        readonly required: readonly ["projectPath", "autoloadName", "autoloadPath"];
    };
} | {
    readonly name: "remove_autoload";
    readonly description: "Unregister an autoload from a project by name. Use to recover from a broken autoload that is crashing headless ops. No Godot process required. Returns plain-text confirmation on success. Errors if no autoload with that name exists.";
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
            readonly autoloadName: {
                readonly type: "string";
                readonly description: "Name of the autoload to remove";
            };
        };
        readonly required: readonly ["projectPath", "autoloadName"];
    };
} | {
    readonly name: "update_autoload";
    readonly description: "Modify an existing autoload's path or singleton flag. Pass either or both — omitted fields keep their current value. Use instead of remove_autoload + add_autoload (single edit, no orphan window). No Godot process required. Returns plain-text confirmation on success. Errors if autoloadName is not registered.";
    readonly annotations: {
        readonly idempotentHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly autoloadName: {
                readonly type: "string";
                readonly description: "Name of the autoload to update";
            };
            readonly autoloadPath: {
                readonly type: "string";
                readonly description: "New path to the script or scene";
            };
            readonly singleton: {
                readonly type: "boolean";
                readonly description: "New singleton flag";
            };
        };
        readonly required: readonly ["projectPath", "autoloadName"];
    };
} | {
    readonly name: "delete_nodes";
    readonly description: "Remove one or more nodes (and their descendants) from a scene file. Always-array: pass a single-element nodePaths array for one-off deletes. Saves once at the end. Cannot delete the scene root — that entry returns an error and the rest still process. Returns: results array with one entry per nodePath in input order (success or error message).";
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
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project (e.g. \"scenes/main.tscn\")";
            };
            readonly nodePaths: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Node paths from scene root to delete (e.g. [\"root/Player/Sprite2D\"])";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePaths"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly results: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nodePath: {
                            readonly type: "string";
                        };
                        readonly success: {
                            readonly type: "boolean";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
    };
} | {
    readonly name: "set_node_properties";
    readonly description: "Set one or more node properties on a scene in a single Godot process. Always-array: pass a single-element updates array for one-off edits. Vector2 ({x,y}), Vector3 ({x,y,z}), and Color ({r,g,b,a}) auto-convert; primitives pass through. For other complex GDScript types (Resource, NodePath, etc.), use run_script. abortOnError stops on first failure (default false continues). Saves once at the end. Returns: results[] with one entry per update in input order (success or error).";
    readonly annotations: {
        readonly idempotentHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly updates: {
                readonly type: "array";
                readonly description: "Property updates to apply";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nodePath: {
                            readonly type: "string";
                            readonly description: "Node path from scene root (e.g. \"root/Player\")";
                        };
                        readonly property: {
                            readonly type: "string";
                            readonly description: "GDScript property name in snake_case (e.g. \"position\", \"modulate\", \"collision_layer\")";
                        };
                        readonly value: {
                            readonly description: "New property value";
                        };
                    };
                    readonly required: readonly ["nodePath", "property", "value"];
                };
            };
            readonly abortOnError: {
                readonly type: "boolean";
                readonly description: "Stop processing on first error (default: false)";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "updates"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly results: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nodePath: {
                            readonly type: "string";
                        };
                        readonly property: {
                            readonly type: "string";
                        };
                        readonly success: {
                            readonly type: "boolean";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
    };
} | {
    readonly name: "get_node_properties";
    readonly description: "Read one or more nodes' current property values from a scene file in a single Godot process. Always-array: pass a single-element nodes array for one-off reads. Per-node changedOnly:true filters out properties matching class defaults (useful for compact diffs). Returns: { results: [{ nodePath, nodeType, properties?, error? }] }; failed reads include error and omit properties.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodes: {
                readonly type: "array";
                readonly description: "Nodes to read properties from";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nodePath: {
                            readonly type: "string";
                            readonly description: "Node path from scene root (e.g. \"root/Player\")";
                        };
                        readonly changedOnly: {
                            readonly type: "boolean";
                            readonly description: "Only return properties differing from defaults (default: false)";
                        };
                    };
                    readonly required: readonly ["nodePath"];
                };
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodes"];
    };
} | {
    readonly name: "attach_script";
    readonly description: "Attach an existing GDScript file to a node in a scene. Use after writing the script with the standard file tools and validating it via the validate tool. Replaces any previously attached script. Saves automatically. Returns: success with the resolved nodePath and scriptPath that were attached. Errors if scriptPath does not exist or nodePath is not found.";
    readonly annotations: {
        readonly idempotentHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodePath: {
                readonly type: "string";
                readonly description: "Node path from scene root (e.g. \"root/Player\")";
            };
            readonly scriptPath: {
                readonly type: "string";
                readonly description: "Path to the GDScript file relative to the project (e.g. \"scripts/player.gd\")";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePath", "scriptPath"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly success: {
                readonly type: "boolean";
            };
            readonly nodePath: {
                readonly type: "string";
            };
            readonly scriptPath: {
                readonly type: "string";
            };
        };
    };
} | {
    readonly name: "get_scene_tree";
    readonly description: "Get the scene hierarchy as a nested tree of { name, type, path, script, children }. Use maxDepth:1 for a shallow listing of direct children only; default -1 returns the full tree. parentPath scopes the result to a subtree. Returns the nested tree as JSON text. Errors if scene does not exist or parentPath is not found.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly parentPath: {
                readonly type: "string";
                readonly description: "Scope to a subtree starting at this node path (e.g. \"root/Player\")";
            };
            readonly maxDepth: {
                readonly type: "number";
                readonly description: "Maximum recursion depth. -1 for unlimited (default: -1). 1 returns only direct children.";
            };
        };
        readonly required: readonly ["projectPath", "scenePath"];
    };
} | {
    readonly name: "duplicate_node";
    readonly description: "Duplicate a node and its descendants in a Godot scene. Use to clone a configured subtree without re-creating it node-by-node via add_node. newName defaults to the original name + \"2\"; targetParentPath defaults to the original parent. Saves automatically. Returns: success with originalPath and the newPath where the duplicate now lives — use newPath for follow-up edits. Errors if nodePath does not exist or targetParentPath cannot accept children.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodePath: {
                readonly type: "string";
                readonly description: "Node path from scene root to duplicate";
            };
            readonly newName: {
                readonly type: "string";
                readonly description: "Name for the duplicated node (default: original name + \"2\")";
            };
            readonly targetParentPath: {
                readonly type: "string";
                readonly description: "Parent node path for the duplicate (default: same parent as original)";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePath"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly success: {
                readonly type: "boolean";
            };
            readonly originalPath: {
                readonly type: "string";
            };
            readonly newPath: {
                readonly type: "string";
            };
        };
    };
} | {
    readonly name: "get_node_signals";
    readonly description: "List all signals defined on a node and their current connections. Use before connect_signal/disconnect_signal to verify signal/method names. The connections[].target field uses Godot absolute path format (/root/Scene/Node) — convert to scene-root-relative (root/Node) before passing to connect/disconnect_signal. Returns: nodeType and signals[], each with name and current connections (signal/target/method). Errors if node not found.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodePath: {
                readonly type: "string";
                readonly description: "Node path from scene root (e.g. \"root/Button\")";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePath"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly nodePath: {
                readonly type: "string";
            };
            readonly nodeType: {
                readonly type: "string";
            };
            readonly signals: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                        };
                        readonly connections: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly signal: {
                                        readonly type: "string";
                                    };
                                    readonly target: {
                                        readonly type: "string";
                                    };
                                    readonly method: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} | {
    readonly name: "connect_signal";
    readonly description: "Connect a signal on a source node to a method on a target node, persisting the connection in the .tscn. Use after get_node_signals to confirm the signal name on the source and the method name on the target. Connecting the same signal+method pair twice creates a duplicate connection — call get_node_signals first if uncertain. Saves automatically. Returns a plain-text confirmation naming the source, signal, target, and method. Errors if the signal does not exist on the source node or the method does not exist on the target node.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodePath: {
                readonly type: "string";
                readonly description: "Source node path from scene root";
            };
            readonly signal: {
                readonly type: "string";
                readonly description: "Signal name on the source node (e.g. \"pressed\", \"body_entered\")";
            };
            readonly targetNodePath: {
                readonly type: "string";
                readonly description: "Target node path from scene root that receives the signal";
            };
            readonly method: {
                readonly type: "string";
                readonly description: "Method name on the target node to call when the signal fires";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePath", "signal", "targetNodePath", "method"];
    };
} | {
    readonly name: "disconnect_signal";
    readonly description: "Remove an existing signal connection between two nodes, persisting the change in the .tscn. Use get_node_signals first to confirm the connection exists; recovery requires reconnecting via connect_signal. Saves automatically. Returns a plain-text confirmation naming the disconnected signal and target. Errors if the connection does not exist.";
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
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodePath: {
                readonly type: "string";
                readonly description: "Source node path from scene root";
            };
            readonly signal: {
                readonly type: "string";
                readonly description: "Signal name on the source node";
            };
            readonly targetNodePath: {
                readonly type: "string";
                readonly description: "Target node path from scene root";
            };
            readonly method: {
                readonly type: "string";
                readonly description: "Method name on the target node";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePath", "signal", "targetNodePath", "method"];
    };
} | {
    readonly name: "list_projects";
    readonly description: "Find Godot projects under a directory by locating project.godot files. Use to discover available projects when the user has not specified one; for inspecting a known project, use get_project_info. recursive:true descends into subdirectories (skipping hidden ones); default false checks only the directory itself and its immediate children. Returns: [{ path, name }], empty array on no matches.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly directory: {
                readonly type: "string";
                readonly description: "Directory to search for Godot projects";
            };
            readonly recursive: {
                readonly type: "boolean";
                readonly description: "Whether to search recursively (default: false)";
            };
        };
        readonly required: readonly ["directory"];
    };
} | {
    readonly name: "get_project_info";
    readonly description: "Get metadata about a Godot project: name, path, Godot version, and a structure summary (counts of scenes/scripts/assets/other). Omit projectPath to get just the Godot version (useful for capability checks). Returns: { name, path, godotVersion, structure } or { godotVersion } when projectPath is omitted. Errors if projectPath is set but lacks project.godot.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory (optional — omit to get Godot version only)";
            };
        };
        readonly required: readonly [];
    };
} | {
    readonly name: "get_project_files";
    readonly description: "Return a recursive file tree of a Godot project. Use to discover project structure when paths are unknown. Pass extensions to filter (e.g. [\"gd\",\"tscn\"]); maxDepth caps recursion (-1 unlimited). Skips hidden (dot-prefixed) entries and the .mcp directory. Returns: { name, type, path, extension?, children? } (nested tree).";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly maxDepth: {
                readonly type: "number";
                readonly description: "Maximum recursion depth. -1 means unlimited (default: -1)";
            };
            readonly extensions: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Filter to only these file extensions (e.g. [\"gd\", \"tscn\"]). Omit to include all.";
            };
        };
        readonly required: readonly ["projectPath"];
    };
} | {
    readonly name: "search_project";
    readonly description: "Plain-text (substring) search across project files. Use to find references, callers, or signatures across the codebase. Default fileTypes is [\"gd\",\"tscn\",\"cs\",\"gdshader\"]; caseSensitive default false; maxResults default 100. Skips hidden entries and the .mcp directory. Returns: matches[] (project-relative file, 1-indexed lineNumber, line text) and truncated:true when maxResults was hit — consider raising it.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly pattern: {
                readonly type: "string";
                readonly description: "Plain-text string to search for";
            };
            readonly fileTypes: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "File extensions to search (default: [\"gd\", \"tscn\", \"cs\", \"gdshader\"])";
            };
            readonly caseSensitive: {
                readonly type: "boolean";
                readonly description: "Case-sensitive search (default: false)";
            };
            readonly maxResults: {
                readonly type: "number";
                readonly description: "Maximum matches to return (default: 100)";
            };
        };
        readonly required: readonly ["projectPath", "pattern"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly matches: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly file: {
                            readonly type: "string";
                        };
                        readonly lineNumber: {
                            readonly type: "number";
                        };
                        readonly line: {
                            readonly type: "string";
                        };
                    };
                };
            };
            readonly truncated: {
                readonly type: "boolean";
            };
        };
    };
} | {
    readonly name: "get_scene_dependencies";
    readonly description: "Parse a .tscn file for ext_resource references (scripts, textures, subscenes). Use to inspect what a scene depends on before refactoring or moving files. Returns: the queried scene path and dependencies[] from ext_resource refs (path, type, optional uid). Errors if scene file does not exist.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Path to the .tscn file relative to the project root (e.g. \"scenes/main.tscn\")";
            };
        };
        readonly required: readonly ["projectPath", "scenePath"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly scene: {
                readonly type: "string";
            };
            readonly dependencies: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly path: {
                            readonly type: "string";
                        };
                        readonly type: {
                            readonly type: "string";
                        };
                        readonly uid: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
    };
} | {
    readonly name: "get_project_settings";
    readonly description: "Parse project.godot into structured JSON. Use to inspect configured display, input, rendering, etc. settings without launching Godot. Pass section to filter to one INI section (e.g. \"display\", \"application\"). Returns: { settings: { [section]: { [key]: value } } } or { settings: { [key]: value } } when section is given. Complex Godot types are returned as raw strings; keys outside any section appear under __global__.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly section: {
                readonly type: "string";
                readonly description: "Filter to a specific INI section (e.g. \"display\", \"application\"). Omit for all sections.";
            };
        };
        readonly required: readonly ["projectPath"];
    };
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
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
} | {
    readonly name: "create_scene";
    readonly description: "Create a new Godot scene file with a single root node. Writes a fresh .tscn at scenePath. Use when starting a new scene from scratch; for adding nodes to an existing scene, use add_node. rootNodeType defaults to Node2D — pass \"Node3D\" for 3D scenes or \"Control\" for UI. Saves automatically. Overwrites silently if the file already exists. Returns: success and the scenePath that was written.";
    readonly annotations: {
        readonly idempotentHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project (e.g. \"scenes/main.tscn\")";
            };
            readonly rootNodeType: {
                readonly type: "string";
                readonly description: "Root node type (default: Node2D)";
            };
        };
        readonly required: readonly ["projectPath", "scenePath"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly success: {
                readonly type: "boolean";
            };
            readonly scenePath: {
                readonly type: "string";
            };
        };
    };
} | {
    readonly name: "add_node";
    readonly description: "Add a node to a Godot scene. Saves automatically. Common spatial properties (position, position3d, rotation, scale, visible, modulate) can be set as top-level params; for any other property, pass it under properties. Vector2/Vector3/Color values auto-convert from {x,y}/{x,y,z}/{r,g,b,a}. parentNodePath defaults to the scene root. Returns a plain-text confirmation message naming the new node and type. Errors if nodeType is not a registered Godot class or parentNodePath does not exist.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodeType: {
                readonly type: "string";
                readonly description: "Godot node class to instantiate (e.g. \"Sprite2D\", \"CollisionShape2D\", \"Label\")";
            };
            readonly nodeName: {
                readonly type: "string";
                readonly description: "Name for the new node as it appears in the scene tree";
            };
            readonly parentNodePath: {
                readonly type: "string";
                readonly description: "Parent node path from scene root (e.g. \"root/Player\"). Defaults to the root node.";
            };
            readonly position: {
                readonly type: "object";
                readonly description: "Vector2 position (e.g. {\"x\": 100, \"y\": 200})";
                readonly properties: {
                    readonly x: {
                        readonly type: "number";
                    };
                    readonly y: {
                        readonly type: "number";
                    };
                };
            };
            readonly position3d: {
                readonly type: "object";
                readonly description: "Vector3 position for 3D nodes (e.g. {\"x\": 0, \"y\": 1, \"z\": 0})";
                readonly properties: {
                    readonly x: {
                        readonly type: "number";
                    };
                    readonly y: {
                        readonly type: "number";
                    };
                    readonly z: {
                        readonly type: "number";
                    };
                };
            };
            readonly rotation: {
                readonly type: "number";
                readonly description: "Rotation in radians";
            };
            readonly scale: {
                readonly type: "object";
                readonly description: "Vector2 scale (e.g. {\"x\": 2, \"y\": 2})";
                readonly properties: {
                    readonly x: {
                        readonly type: "number";
                    };
                    readonly y: {
                        readonly type: "number";
                    };
                };
            };
            readonly visible: {
                readonly type: "boolean";
                readonly description: "Whether the node is visible";
            };
            readonly modulate: {
                readonly type: "object";
                readonly description: "Color modulation (e.g. {\"r\": 1, \"g\": 0, \"b\": 0, \"a\": 1})";
                readonly properties: {
                    readonly r: {
                        readonly type: "number";
                    };
                    readonly g: {
                        readonly type: "number";
                    };
                    readonly b: {
                        readonly type: "number";
                    };
                    readonly a: {
                        readonly type: "number";
                    };
                };
            };
            readonly properties: {
                readonly type: "object";
                readonly description: "Additional property values as a JSON object. Top-level params (position, rotation, etc.) take precedence over keys in this dict.";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodeType", "nodeName"];
    };
} | {
    readonly name: "load_sprite";
    readonly description: "Set the texture on an existing Sprite2D, Sprite3D, or TextureRect node. Use this when the node already exists; for new nodes, pass texture via add_node properties. Saves automatically. texturePath must be a real file under projectPath. Returns a plain-text confirmation message naming the loaded texture. Errors if the node is not one of those three classes, or the texture file does not exist.";
    readonly annotations: {
        readonly idempotentHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly nodePath: {
                readonly type: "string";
                readonly description: "Path to the target node from scene root (e.g. \"root/Player/Sprite2D\")";
            };
            readonly texturePath: {
                readonly type: "string";
                readonly description: "Path to the texture file relative to the project (e.g. \"assets/player.png\")";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "nodePath", "texturePath"];
    };
} | {
    readonly name: "save_scene";
    readonly description: "Re-pack and save a scene, optionally to a different path (save-as). Most mutations (add_node, set_node_properties, delete_nodes, etc.) auto-save — only use this for save-as via newPath, or to re-canonicalize a hand-edited .tscn. Overwrites silently. Returns a plain-text confirmation naming the save path. Errors if the scene file does not exist.";
    readonly annotations: {
        readonly idempotentHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly newPath: {
                readonly type: "string";
                readonly description: "Save to a different path (relative to project) instead of overwriting the original";
            };
        };
        readonly required: readonly ["projectPath", "scenePath"];
    };
} | {
    readonly name: "export_mesh_library";
    readonly description: "Export a scene of MeshInstance3D nodes as a MeshLibrary .res file for use in GridMap. Use this when authoring tile palettes for grid-based 3D levels; ignore for 2D or general scene work. The source scene must contain MeshInstance3D children. Pass meshItemNames to export a subset, or omit to export all. Saves the .res to outputPath, overwriting silently. Returns a plain-text confirmation with the exported item count. Errors if the scene contains no valid meshes.";
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
            readonly scenePath: {
                readonly type: "string";
                readonly description: "Scene file path relative to the project";
            };
            readonly outputPath: {
                readonly type: "string";
                readonly description: "Output path for the MeshLibrary .res file (relative to project)";
            };
            readonly meshItemNames: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Names of specific mesh items to export. Omit to export all.";
            };
        };
        readonly required: readonly ["projectPath", "scenePath", "outputPath"];
    };
} | {
    readonly name: "batch_scene_operations";
    readonly description: "Use this instead of chaining add_node / load_sprite / save_scene calls when you have multiple mutations on the same or related scenes — runs in one Godot process (~3s startup avoided per call) and shares an in-memory scene cache, saving once at the end. Each item picks its sub-operation (add_node, load_sprite, save) and supplies its own params; abortOnError stops on first failure (default false continues). Returns: results[] in input order, each tagged with operation and scenePath plus success or error.";
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
            readonly operations: {
                readonly type: "array";
                readonly description: "Ordered list of scene operations. Each item has its own operation and scenePath.";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly enum: readonly ["add_node", "load_sprite", "save"];
                            readonly description: "The sub-operation to perform";
                        };
                        readonly scenePath: {
                            readonly type: "string";
                            readonly description: "Scene file path for this operation";
                        };
                        readonly nodeType: {
                            readonly type: "string";
                            readonly description: "[add_node] Node class to instantiate";
                        };
                        readonly nodeName: {
                            readonly type: "string";
                            readonly description: "[add_node] Name for the new node";
                        };
                        readonly parentNodePath: {
                            readonly type: "string";
                            readonly description: "[add_node] Parent node path (defaults to root)";
                        };
                        readonly properties: {
                            readonly type: "object";
                            readonly description: "[add_node] Initial property values";
                        };
                        readonly nodePath: {
                            readonly type: "string";
                            readonly description: "[load_sprite] Target node path";
                        };
                        readonly texturePath: {
                            readonly type: "string";
                            readonly description: "[load_sprite] Texture file path relative to project";
                        };
                        readonly newPath: {
                            readonly type: "string";
                            readonly description: "[save] Save to a different path instead of overwriting";
                        };
                    };
                    readonly required: readonly ["operation"];
                };
            };
            readonly abortOnError: {
                readonly type: "boolean";
                readonly description: "Stop processing on first error (default: false)";
            };
        };
        readonly required: readonly ["projectPath", "operations"];
    };
    readonly outputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly results: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                        };
                        readonly scenePath: {
                            readonly type: "string";
                        };
                        readonly success: {
                            readonly type: "boolean";
                        };
                        readonly error: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
    };
} | {
    readonly name: "validate";
    readonly description: "Validate GDScript syntax or scene file integrity using headless Godot. Use before attach_script or run_script to catch parse errors early. Single-target: provide exactly one of scriptPath, source, or scenePath. Batch: provide a targets array — runs all in one Godot process. Returns { valid, errors: [{ line?, message }] } for single, or { results: [{ target, valid, errors }] } for batch. Line numbers appear when Godot's stderr includes them (not always). Returns valid:false on any parse error; never throws.";
    readonly annotations: {
        readonly readOnlyHint: true;
    };
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly projectPath: {
                readonly type: "string";
                readonly description: "Path to the Godot project directory";
            };
            readonly scriptPath: {
                readonly type: "string";
                readonly description: "[single] Path to a .gd file relative to the project to validate (e.g. \"scripts/player.gd\")";
            };
            readonly source: {
                readonly type: "string";
                readonly description: "[single] Inline GDScript source code to validate. Written to a temporary file and validated against the project.";
            };
            readonly scenePath: {
                readonly type: "string";
                readonly description: "[single] Path to a .tscn scene file relative to the project to validate (e.g. \"scenes/main.tscn\")";
            };
            readonly targets: {
                readonly type: "array";
                readonly description: "[batch] Array of targets to validate in a single Godot process. Each item must have exactly one of: scriptPath, source, or scenePath.";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly scriptPath: {
                            readonly type: "string";
                            readonly description: "Path to a .gd file relative to the project";
                        };
                        readonly source: {
                            readonly type: "string";
                            readonly description: "Inline GDScript source code";
                        };
                        readonly scenePath: {
                            readonly type: "string";
                            readonly description: "Path to a .tscn file relative to the project";
                        };
                    };
                };
            };
        };
        readonly required: readonly ["projectPath"];
    };
})[];
export declare const serverInstructions = "Godot MCP Server \u2014 AI-driven Godot 4.x project manipulation.\n\nTool categories:\n- Project management: launch_editor, run_project, attach_project, detach_project, stop_project, get_debug_output, list_projects, get_project_info\n- Scene editing (headless): create_scene, add_node, load_sprite, save_scene, export_mesh_library, batch_scene_operations\n- Node editing (headless): delete_nodes, set_node_properties, get_node_properties, attach_script, get_scene_tree, duplicate_node, get_node_signals, connect_signal, disconnect_signal\n- Runtime (requires run_project or attach_project): take_screenshot, simulate_input, get_ui_elements, run_script\n- Project config (no Godot process): list_autoloads, add_autoload, remove_autoload, update_autoload, get_project_files, search_project, get_scene_dependencies, get_project_settings\n- Validation: validate\n\nKey behaviors:\n- All mutation operations (add_node, set_node_properties, delete_nodes, etc.) save the scene automatically. Only use save_scene for save-as (newPath) or re-canonicalization.\n- Headless Godot initializes ALL registered autoloads. If any autoload is broken, headless operations will fail. Use list_autoloads / remove_autoload to diagnose.\n- run_project verifies bridge readiness before returning success. If it reports degraded status, retry runtime tools after a moment or check get_debug_output.\n- attach_project is the fallback path for a manually launched Godot process. It injects the bridge and marks the project active, but it does not spawn Godot or capture stdout/stderr.\n- click_element in simulate_input resolves by node path or node name (BFS search), NOT by visible text. Use get_ui_elements to discover valid element identifiers.\n- run_script expects GDScript with \"extends RefCounted\" and \"func execute(scene_tree: SceneTree) -> Variant\".\n- run_project spawns Godot without -d so runtime errors do not pause execution; the `breakpoint` keyword in user code is a no-op (no debugger is attached). SCRIPT ERROR output and GDScript backtraces still appear in stderr.";
//# sourceMappingURL=index.d.ts.map