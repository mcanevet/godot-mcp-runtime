/**
 * Nominal-type helpers for string primitives that carry validation invariants.
 *
 * A `Brand<string, 'ProjectPath'>` is structurally still a string, but the
 * `__brand` phantom field prevents arbitrary strings from being assigned to it
 * without an explicit cast. The only place those casts live is in the parsers
 * in `arg-parsing.ts` — every other module receives already-branded values
 * and never has to repeat the validation.
 */
export {};
//# sourceMappingURL=branded.js.map