/**
 * Hand-written state-machine tokenizer for GDScript source.
 *
 * Used by `run-script-policy.ts` to evaluate scripts against the declarative
 * rule table. The tokenizer's job is to strip comments and string literals so
 * the policy never matches text inside `"OS.execute"` or `# OS.execute`, and
 * to coalesce member-access chains (`OS.execute`, `Foo.bar.baz`) into a single
 * `memberChain` token whose `chain` array the rules match against directly.
 *
 * Not a full GDScript parser — we only need enough to:
 *  - Recognize comments (`#` to EOL).
 *  - Skip string-literal contents in all GDScript forms (`"..."`, `'...'`,
 *    `"""..."""`, `'''...'''`).
 *  - Skip node-path literals (`$Foo/Bar`, `^"..."`) — their contents are
 *    Godot scene paths, not GDScript code.
 *  - Emit identifiers, member chains, parentheses, commas, and a small set
 *    of other punctuation. Everything else (operators, numbers) collapses to
 *    an `other` token the policy ignores.
 *  - Track line numbers and the rough start column of each token so policy
 *    findings can name the offending line.
 *
 * Line continuation (`\` at end of line) is handled by treating the next line
 * as a continuation of the current logical line for member-chain coalescing
 * purposes.
 *
 * This tokenizer is a best-effort accident guard, not a sound static
 * analysis — see `run-script-policy.ts` and `docs/security.md` for the full
 * doctrine. One structural blind spot worth stating plainly here, since it's
 * inherent to token-level scanning and not a gap the next feature closes:
 * identifier aliasing / dataflow is invisible. `var f = OS; f.execute(...)`
 * tokenizes as two unrelated identifiers — the tokenizer has no notion of
 * "what does this variable refer to," so a rule keyed on `OS.execute` never
 * fires. Do not mistake this for a TODO; closing it would require a dataflow
 * analysis, which is out of scope for a hand-written tokenizer by design.
 */
export type TokenKind = 'identifier' | 'memberChain' | 'string' | 'number' | 'punct' | 'newline' | 'other';
export interface Token {
    kind: TokenKind;
    text: string;
    /** For memberChain, the dotted segments in order: `OS.execute` → `['OS','execute']`. */
    chain?: string[];
    line: number;
    column: number;
}
/**
 * Tokens emitted by `tokenize`. Comments and string-literal contents are NOT
 * present — they are consumed silently. String literals as a whole are emitted
 * as a single `string` token so the policy can recognize "literal first
 * argument" patterns (e.g. `load("res://foo.tscn")`) without seeing the
 * characters inside.
 */
export declare function tokenize(source: string): Token[];
/**
 * Convenience: return only the non-newline, non-whitespace tokens. Useful for
 * policy rules that don't care about line structure.
 */
export declare function tokenizeStripped(source: string): Token[];
//# sourceMappingURL=gdscript-scanner.d.ts.map