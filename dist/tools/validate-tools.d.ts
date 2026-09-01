import type { GodotRunner } from '../utils/godot-runner.js';
import type { HandlerResult, OperationParams } from '../mcp.types.js';
export declare const validateToolDefinitions: readonly [{
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
}];
export declare function handleValidate(runner: GodotRunner, args: OperationParams): Promise<HandlerResult>;
//# sourceMappingURL=validate-tools.d.ts.map