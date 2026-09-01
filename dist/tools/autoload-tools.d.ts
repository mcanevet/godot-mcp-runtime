import type { HandlerResult, OperationParams } from '../mcp.types.js';
export declare const autoloadToolDefinitions: readonly [{
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
}, {
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
}, {
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
}, {
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
}];
export declare function handleListAutoloads(args: OperationParams): HandlerResult;
export declare function handleAddAutoload(args: OperationParams): HandlerResult;
export declare function handleRemoveAutoload(args: OperationParams): HandlerResult;
export declare function handleUpdateAutoload(args: OperationParams): HandlerResult;
//# sourceMappingURL=autoload-tools.d.ts.map