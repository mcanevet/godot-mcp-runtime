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
 */

export type TokenKind =
  | 'identifier'
  | 'memberChain'
  | 'string'
  | 'number'
  | 'punct'
  | 'newline'
  | 'other';

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
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const len = source.length;
  let i = 0;
  let line = 1;
  let lineStart = 0;

  const colOf = (pos: number): number => pos - lineStart + 1;

  const isIdentStart = (ch: string): boolean => /[A-Za-z_]/.test(ch);
  const isIdentPart = (ch: string): boolean => /[A-Za-z0-9_]/.test(ch);
  const isDigit = (ch: string): boolean => /[0-9]/.test(ch);

  while (i < len) {
    const ch = source[i]!;

    // Newline — emit, advance line counter.
    if (ch === '\n') {
      tokens.push({ kind: 'newline', text: '\n', line, column: colOf(i) });
      i++;
      line++;
      lineStart = i;
      continue;
    }

    // \r\n or bare \r — treat as newline.
    if (ch === '\r') {
      tokens.push({ kind: 'newline', text: '\n', line, column: colOf(i) });
      i++;
      if (i < len && source[i] === '\n') i++;
      line++;
      lineStart = i;
      continue;
    }

    // Whitespace.
    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }

    // Line continuation: `\` at end of line. Skip the backslash + newline so
    // the next physical line is treated as the same logical line for chain
    // coalescing. Don't emit a newline token in this case.
    if (ch === '\\') {
      let j = i + 1;
      while (j < len && (source[j] === ' ' || source[j] === '\t')) j++;
      if (j < len && (source[j] === '\n' || source[j] === '\r')) {
        i = j + 1;
        if (i < len && source[j] === '\r' && source[i] === '\n') i++;
        line++;
        lineStart = i;
        continue;
      }
      // Bare backslash is rare in GDScript outside strings; emit as other.
      tokens.push({ kind: 'other', text: '\\', line, column: colOf(i) });
      i++;
      continue;
    }

    // Comment: `#` to EOL. Consume silently.
    if (ch === '#') {
      while (i < len && source[i] !== '\n' && source[i] !== '\r') i++;
      continue;
    }

    // String literals (all GDScript forms).
    if (ch === '"' || ch === "'") {
      const startLine = line;
      const startCol = colOf(i);
      const quote = ch;
      // Triple-quoted?
      if (i + 2 < len && source[i + 1] === quote && source[i + 2] === quote) {
        i += 3;
        while (i < len) {
          if (source[i] === '\\' && i + 1 < len) {
            // Skip escaped char; track newlines inside the escape sequence.
            if (source[i + 1] === '\n') {
              line++;
              lineStart = i + 2;
            }
            i += 2;
            continue;
          }
          if (source[i] === '\n') {
            line++;
            lineStart = i + 1;
            i++;
            continue;
          }
          if (
            source[i] === quote &&
            i + 2 < len &&
            source[i + 1] === quote &&
            source[i + 2] === quote
          ) {
            i += 3;
            break;
          }
          i++;
        }
        tokens.push({ kind: 'string', text: '<triple-string>', line: startLine, column: startCol });
        continue;
      }
      // Single-line string.
      i++;
      while (i < len && source[i] !== quote && source[i] !== '\n' && source[i] !== '\r') {
        if (source[i] === '\\' && i + 1 < len) {
          i += 2;
          continue;
        }
        i++;
      }
      if (i < len && source[i] === quote) i++;
      tokens.push({ kind: 'string', text: '<string>', line: startLine, column: startCol });
      continue;
    }

    // Node-path literal: `$Foo/Bar` or `$"Foo Bar"`. Consume to whitespace,
    // newline, or a clear non-path delimiter.
    if (ch === '$') {
      const startLine = line;
      const startCol = colOf(i);
      i++;
      if (i < len && (source[i] === '"' || source[i] === "'")) {
        const quote = source[i]!;
        i++;
        while (i < len && source[i] !== quote && source[i] !== '\n') i++;
        if (i < len && source[i] === quote) i++;
      } else {
        while (i < len && /[A-Za-z0-9_/\\]/.test(source[i]!)) i++;
      }
      tokens.push({ kind: 'string', text: '<node-path>', line: startLine, column: startCol });
      continue;
    }

    // String-name literal: `^"..."` or `^Identifier`. Treat as opaque string.
    if (ch === '^') {
      const startLine = line;
      const startCol = colOf(i);
      i++;
      if (i < len && (source[i] === '"' || source[i] === "'")) {
        const quote = source[i]!;
        i++;
        while (i < len && source[i] !== quote && source[i] !== '\n') {
          if (source[i] === '\\' && i + 1 < len) {
            i += 2;
            continue;
          }
          i++;
        }
        if (i < len && source[i] === quote) i++;
      } else {
        while (i < len && /[A-Za-z0-9_]/.test(source[i]!)) i++;
      }
      tokens.push({ kind: 'string', text: '<string-name>', line: startLine, column: startCol });
      continue;
    }

    // Number literal — emit but otherwise ignored by policy.
    if (isDigit(ch)) {
      const startLine = line;
      const startCol = colOf(i);
      const start = i;
      while (i < len && (isDigit(source[i]!) || source[i] === '.' || source[i] === '_')) {
        i++;
      }
      // Exponent.
      if (i < len && (source[i] === 'e' || source[i] === 'E')) {
        i++;
        if (i < len && (source[i] === '+' || source[i] === '-')) i++;
        while (i < len && isDigit(source[i]!)) i++;
      }
      tokens.push({
        kind: 'number',
        text: source.slice(start, i),
        line: startLine,
        column: startCol,
      });
      continue;
    }

    // Identifier or member chain. Build the chain by reading identifier
    // segments separated by `.` (with no whitespace between identifier and
    // dot — `foo .bar` is two tokens, but GDScript style is `foo.bar`).
    if (isIdentStart(ch)) {
      const startLine = line;
      const startCol = colOf(i);
      const start = i;
      while (i < len && isIdentPart(source[i]!)) i++;
      const first = source.slice(start, i);
      const chain: string[] = [first];
      let endText = first;
      // Continue chain across `.identifier` segments. Allow whitespace and
      // line continuations were already stripped earlier (the `\` + EOL
      // branch above eats the EOL without emitting a newline).
      while (i < len && source[i] === '.') {
        const dotPos = i;
        const j = i + 1;
        if (j < len && isIdentStart(source[j]!)) {
          // Consume the next identifier segment.
          let k = j;
          while (k < len && isIdentPart(source[k]!)) k++;
          chain.push(source.slice(j, k));
          endText += '.' + source.slice(j, k);
          i = k;
          continue;
        }
        // `.` not followed by identifier — break out, leaving the dot for
        // the next iteration to emit as punct.
        void dotPos;
        break;
      }
      if (chain.length > 1) {
        tokens.push({
          kind: 'memberChain',
          text: endText,
          chain,
          line: startLine,
          column: startCol,
        });
      } else {
        tokens.push({ kind: 'identifier', text: first, line: startLine, column: startCol });
      }
      continue;
    }

    // Punctuation we care about.
    if (ch === '(' || ch === ')' || ch === ',' || ch === '[' || ch === ']' || ch === '=') {
      tokens.push({ kind: 'punct', text: ch, line, column: colOf(i) });
      i++;
      continue;
    }

    // Anything else (operators, `:`, `.` outside member chain) — collapse to other.
    tokens.push({ kind: 'other', text: ch, line, column: colOf(i) });
    i++;
  }

  return tokens;
}

/**
 * Convenience: return only the non-newline, non-whitespace tokens. Useful for
 * policy rules that don't care about line structure.
 */
export function tokenizeStripped(source: string): Token[] {
  return tokenize(source).filter((t) => t.kind !== 'newline');
}
