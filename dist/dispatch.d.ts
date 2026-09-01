/**
 * Tool dispatch table.
 *
 * Maps every MCP tool name to a handler that takes the runner + raw args and
 * returns the tool response. Extracted from index.ts so tests can exercise
 * dispatch as a pure data structure (no Server / stdio / lifecycle setup).
 *
 * Behavioral contract preserved from the original switch in index.ts:
 *  - Each name routes to the same handler it did before.
 *  - Unknown tool names throw McpError(MethodNotFound, ...) — see
 *    `dispatchToolCall`.
 */
import type { GodotRunner } from './utils/godot-runner.js';
import type { OperationParams, ToolResponse } from './mcp.types.js';
import { type McpContext } from './utils/mcp-context.js';
import { handleLaunchEditor, handleRunProject, handleAttachProject, handleDetachProject, handleGetDebugOutput, handleStopProject, handleTakeScreenshot, handleSimulateInput, handleGetUiElements, handleRunScript } from './tools/runtime-tools.js';
import { handleGetProjectInfo } from './tools/project-tools.js';
import { handleCreateScene, handleAddNode, handleLoadSprite, handleSaveScene, handleExportMeshLibrary, handleBatchSceneOperations } from './tools/scene-tools.js';
import { handleDeleteNodes, handleSetNodeProperties, handleGetNodeProperties, handleAttachScript, handleGetSceneTree, handleDuplicateNode, handleGetNodeSignals, handleConnectSignal, handleDisconnectSignal } from './tools/node-tools.js';
import { handleValidate } from './tools/validate-tools.js';
export declare const toolDispatch: {
    readonly launch_editor: typeof handleLaunchEditor;
    readonly run_project: typeof handleRunProject;
    readonly attach_project: typeof handleAttachProject;
    readonly detach_project: typeof handleDetachProject;
    readonly get_debug_output: typeof handleGetDebugOutput;
    readonly stop_project: typeof handleStopProject;
    readonly list_projects: (_runner: GodotRunner, args: OperationParams) => Promise<import("./mcp.types.js").HandlerResult>;
    readonly get_project_info: typeof handleGetProjectInfo;
    readonly take_screenshot: typeof handleTakeScreenshot;
    readonly simulate_input: typeof handleSimulateInput;
    readonly get_ui_elements: typeof handleGetUiElements;
    readonly run_script: typeof handleRunScript;
    readonly list_autoloads: (_runner: GodotRunner, args: OperationParams) => import("./mcp.types.js").HandlerResult;
    readonly add_autoload: (_runner: GodotRunner, args: OperationParams) => import("./mcp.types.js").HandlerResult;
    readonly remove_autoload: (_runner: GodotRunner, args: OperationParams) => import("./mcp.types.js").HandlerResult;
    readonly update_autoload: (_runner: GodotRunner, args: OperationParams) => import("./mcp.types.js").HandlerResult;
    readonly get_project_files: (_runner: GodotRunner, args: OperationParams) => Promise<import("./mcp.types.js").HandlerResult>;
    readonly search_project: (_runner: GodotRunner, args: OperationParams) => Promise<import("./mcp.types.js").HandlerResult>;
    readonly get_scene_dependencies: (_runner: GodotRunner, args: OperationParams) => Promise<import("./mcp.types.js").HandlerResult>;
    readonly get_project_settings: (_runner: GodotRunner, args: OperationParams) => Promise<import("./mcp.types.js").HandlerResult>;
    readonly create_scene: typeof handleCreateScene;
    readonly add_node: typeof handleAddNode;
    readonly load_sprite: typeof handleLoadSprite;
    readonly save_scene: typeof handleSaveScene;
    readonly export_mesh_library: typeof handleExportMeshLibrary;
    readonly batch_scene_operations: typeof handleBatchSceneOperations;
    readonly delete_nodes: typeof handleDeleteNodes;
    readonly set_node_properties: typeof handleSetNodeProperties;
    readonly get_node_properties: typeof handleGetNodeProperties;
    readonly attach_script: typeof handleAttachScript;
    readonly get_scene_tree: typeof handleGetSceneTree;
    readonly duplicate_node: typeof handleDuplicateNode;
    readonly get_node_signals: typeof handleGetNodeSignals;
    readonly connect_signal: typeof handleConnectSignal;
    readonly disconnect_signal: typeof handleDisconnectSignal;
    readonly validate: typeof handleValidate;
};
export declare function dispatchToolCall(runner: GodotRunner, toolName: string, args: OperationParams, ctx?: McpContext): Promise<ToolResponse>;
//# sourceMappingURL=dispatch.d.ts.map