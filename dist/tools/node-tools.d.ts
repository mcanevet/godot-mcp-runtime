import type { GodotRunner } from '../utils/godot-runner.js';
import type { HandlerResult, OperationParams } from '../mcp.types.js';
export declare const nodeToolDefinitions: readonly [{
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
}, {
    readonly name: "set_node_properties";
    readonly description: "Set one or more node properties on a scene in a single Godot process. Always-array: pass a single-element updates array for one-off edits. Vector2 ({x,y}), Vector3 ({x,y,z}), and Color ({r,g,b,a}) auto-convert; primitives pass through. Each value must match the property's declared type: the usual widening conversions are allowed (float to int, string to NodePath/StringName, bool to int, Array to a packed array), but anything else errors instead of silently storing the type's zero value. Object-typed properties (Resource or Node, e.g. CollisionShape2D.shape) accept a res:// path (loaded and assigned; errors if the path does not exist or the resource is the wrong type), a typed dict {type: ClassName, ...props} (constructs a Resource inline: ClassDB.instantiate plus validated recursive property assignment, e.g. {type: CircleShape2D, radius: 12.5}; nested resources recurse), or null (clears the property); any other plain value errors. abortOnError stops on first failure (default false continues). Saves once at the end. Returns: results[] with one entry per update in input order (success or error).";
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}];
export declare function handleDeleteNodes(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleSetNodeProperties(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleGetNodeProperties(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleAttachScript(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleGetSceneTree(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleDuplicateNode(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleGetNodeSignals(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleConnectSignal(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleDisconnectSignal(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
//# sourceMappingURL=node-tools.d.ts.map