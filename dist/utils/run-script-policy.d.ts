/**
 * Declarative policy table + evaluator for run_script / run_project security
 * gating. The rule catalogue here is the single auditable surface — see
 * `docs/security.md` for the rationale on each tier assignment.
 *
 * This is a best-effort filter, not a sound one and not a sandbox: GDScript
 * is Turing-complete and reflective, so no tokenizer-level rule table can be
 * complete. It catches the obvious, unobfuscated dangerous primitive; it does
 * not and cannot defend against an adversary who reads this file (it's open
 * source) and constructs a script the rules don't happen to match. See
 * `docs/security.md` "What this does NOT do" for the specific structural
 * gaps (identifier aliasing/dataflow, inline sub_resource scripts, etc.).
 *
 * Three tiers:
 *  - Tier 1 (hard_block): server refuses; bridge never sees the script.
 *  - Tier 2 (elicit_required): server asks client/user; strict mode promotes
 *    these to Tier 1.
 *  - Tier 3 (warn): executes, appended to the response `warnings` array.
 *
 * The evaluator is pure — no I/O, no client coupling. Handlers integrate the
 * decision with the elicitor and audit sidecar.
 */
import { type Token } from './gdscript-scanner.js';
export type Tier = 1 | 2 | 3;
export type Decision = 'hard_block' | 'elicit_required' | 'warn' | 'ok';
export interface PolicyMatch {
    ruleId: string;
    tier: Tier;
    line: number;
    column: number;
    matchedText: string;
    reason: string;
    solutions: string[];
}
export interface PolicyDecision {
    decision: Decision;
    /**
     * Highest tier among matches AFTER strict-mode promotion. `null` when no
     * rule matched (decision === 'ok').
     */
    effectiveTier: Tier | null;
    matches: PolicyMatch[];
    /** True when strict mode rewrote one or more Tier 2 matches to Tier 1. */
    promotedByStrict: boolean;
}
/**
 * A rule matches when the tokenizer emits a `memberChain` whose `chain`
 * array starts with `chain` (exact prefix match). `argumentKind` may further
 * narrow the match by classifying the call's *whole* first argument — used
 * to distinguish `load("res://foo")` (literal, Tier 3) from `load(some_var)`
 * or `load("res://" + evil)` (non-literal, Tier 1). See
 * `classifyFirstArgument` — classification looks at everything up to the
 * next top-level `,` or `)`, not just the first token, so `"a" + b` is
 * correctly non-literal rather than mistaken for the literal `"a"`.
 */
interface PolicyRule {
    id: string;
    tier: Tier;
    /** Member chain that must appear as a prefix. e.g. ['OS','execute']. */
    chain: readonly string[];
    /**
     * Optional: require the call's whole first argument to classify as
     * 'literal' (a lone string token) or 'nonliteral' (anything else — an
     * identifier, an expression, multiple tokens). A no-argument call
     * ('none') never matches either kind. If absent, any context matches.
     */
    argumentKind?: 'literal' | 'nonliteral';
    /**
     * Optional: also fire when the chain appears as a bare identifier (e.g.
     * `load(...)` rather than `Foo.load(...)`). Used for the global functions
     * `load`, `preload`, `str_to_var`, `bytes_to_var_with_objects`.
     */
    matchAsBareIdentifier?: boolean;
    /**
     * Optional: match when `chain`'s single segment appears as the *last*
     * segment of any member chain of length >= 2, rather than as a prefix.
     * Used for the generic non-literal `.call`/`.callv` rule, which must fire
     * on any receiver (`some_node.call(var)`), not just the named singletons
     * that already have dedicated prefix rules above it in the table.
     */
    matchLastSegment?: boolean;
    reason: string;
    solutions: string[];
}
export type ArgumentClassification = 'literal' | 'nonliteral' | 'none';
/**
 * Classify a call's whole first argument, not just its first token — so
 * `load("res://" + evil_var)` is correctly 'nonliteral' instead of matching
 * on the leading string literal alone.
 *
 * Scans from `openParenIndex + 1`, tracking bracket depth so nested
 * `(...)`/`[...]` in the first argument (e.g. `foo(bar(x), y)`) don't
 * mistake an inner terminator for the outer one. A top-level `,` or `)` ends
 * the argument. Newline tokens are skipped (they carry no argument content).
 *
 * - Zero collected tokens → 'none' (a no-arg call — must not match a
 *   non-literal rule, preserving "don't fire on load()").
 * - Exactly one collected token and it is a string literal → 'literal'.
 * - Anything else (an identifier, an operator, multiple tokens) → 'nonliteral'.
 */
export declare function classifyFirstArgument(tokens: readonly Token[], openParenIndex: number): ArgumentClassification;
export declare const policyRules: readonly PolicyRule[];
export declare function evaluateScript(source: string, strict?: boolean): PolicyDecision;
/**
 * Format a one-line summary of the highest-priority finding. Used to build
 * the agent-facing error message on Tier 1 hard-block and Tier 2 denial.
 */
export declare function summarizeMatch(m: PolicyMatch): string;
/**
 * Build the human-readable warnings array attached to a `warn` decision.
 */
export declare function matchesToWarnings(matches: readonly PolicyMatch[]): string[];
export {};
//# sourceMappingURL=run-script-policy.d.ts.map