/**
 * Owns the McpBridge autoload artifact: the script copy in the target project,
 * the `[autoload]` entry in project.godot, the `.mcp/.gdignore` marker, and the
 * `.gitignore` augmentation. GodotRunner delegates to this for inject/cleanup
 * during run_project / attach_project / stop_project flows.
 *
 * The project-root bridge script is runtime-owned and refreshed on first
 * injection for a manager session so a rebuilt server cannot talk to stale
 * GDScript from an earlier run. Idempotent within a session via
 * `injectedProjects`: a second `inject()` call for the same path short-circuits
 * without rewriting project.godot.
 */
export declare class BridgeManager {
    private bridgeScriptPath;
    private injectedProjects;
    private repairedProjects;
    /**
     * Last port baked into the on-disk script per project. Used by the
     * race-detection helper in runtime-tools to spot a concurrent re-inject
     * after a bridge-wait timeout.
     */
    private lastInjectedPort;
    constructor(bridgeScriptPath: string);
    /**
     * @param bakedToken Session token to bake into the on-disk script, for
     *   attach-mode sessions where Node cannot set the env var on a Godot
     *   process the user launched themselves. Spawned sessions deliver the
     *   token via `MCP_SESSION_TOKEN` instead and should omit this so the
     *   shipped `""` default is left in place (fail-open only when no token is
     *   configured at all).
     */
    inject(projectPath: string, port: number, bakedToken?: string): void;
    cleanup(projectPath: string): void;
    /**
     * Read the port currently baked into the project's bridge script. Returns
     * the integer on success, or null if the file is missing, unreadable, or
     * lacks the marker. Used to detect concurrent re-inject after a bridge-
     * wait timeout (another MCP client may have rewritten the port).
     */
    readBakedPort(projectPath: string): number | null;
    /**
     * If project.godot still has an `McpBridge=` line but the script file is
     * missing, the autoload would crash every subsequent headless op. Detect and
     * clean the orphan before running an operation.
     *
     * Cached per project: once a path has been checked clean, skip the file
     * reads on subsequent ops in the same session.
     */
    repairOrphaned(projectPath: string): void;
    private removeBridgeArtifacts;
    private ensureMcpGdignore;
    private ensureGitignored;
}
//# sourceMappingURL=bridge-manager.d.ts.map