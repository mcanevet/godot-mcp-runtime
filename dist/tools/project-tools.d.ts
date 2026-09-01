import type { GodotRunner } from '../utils/godot-runner.js';
import type { HandlerResult, OperationParams } from '../mcp.types.js';
export declare const projectToolDefinitions: readonly [{
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}];
export declare function handleListProjects(args: OperationParams): Promise<HandlerResult>;
export declare function handleGetProjectInfo(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
export declare function handleGetProjectFiles(args: OperationParams): Promise<HandlerResult>;
export declare function handleSearchProject(args: OperationParams): Promise<HandlerResult>;
export declare function handleGetSceneDependencies(args: OperationParams): Promise<HandlerResult>;
export declare function handleGetProjectSettings(args: OperationParams): Promise<HandlerResult>;
//# sourceMappingURL=project-tools.d.ts.map