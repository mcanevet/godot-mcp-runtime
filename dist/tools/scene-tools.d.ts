import type { GodotRunner } from '../utils/godot-runner.js';
import type { HandlerResult, OperationParams } from '../mcp.types.js';
export declare const sceneToolDefinitions: readonly [{
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
}, {
    readonly name: "add_node";
    readonly description: "Add a node to a Godot scene. Saves automatically. Common spatial properties (position, position3d, rotation, scale, visible, modulate) can be set as top-level params; for any other property, pass it under properties. Vector2/Vector3/Color values auto-convert from {x,y}/{x,y,z}/{r,g,b,a}. Each value must match the property's declared type: the usual widening conversions are allowed (float to int, string to NodePath/StringName, bool to int, Array to a packed array), but anything else errors instead of silently storing the type's zero value. Object-typed properties (Resource or Node) accept a res:// path (loaded and assigned), a typed dict {type: ClassName, ...props} (constructs a Resource inline: ClassDB.instantiate plus validated recursive property assignment, e.g. shape: {type: RectangleShape2D, size: {x: 80, y: 16}}), or null; any other plain value errors. parentNodePath defaults to the scene root. Returns a plain-text confirmation message naming the new node and type. Errors, and does not add the node, if nodeType is not a registered Godot class, parentNodePath does not exist, a property name in properties does not exist on the node, or a property value is invalid for its declared type.";
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
}, {
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
}, {
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
}, {
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
}, {
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
}];
export declare function handleCreateScene(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleAddNode(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleLoadSprite(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleSaveScene(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleExportMeshLibrary(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleBatchSceneOperations(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
//# sourceMappingURL=scene-tools.d.ts.map