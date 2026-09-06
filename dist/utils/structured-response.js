import { ok } from './result.js';
/**
 * Wrap a structured payload as a handler success that satisfies the MCP
 * outputSchema contract. The same payload is emitted both as a JSON text
 * content block (for lenient clients) and as `structuredContent` (required
 * by strict clients per MCP spec revision 2025-06-18).
 *
 * `extraContent` is prepended for handlers that also return non-text blocks
 * (e.g. `take_screenshot`'s inline image).
 */
export function createStructuredResponse(payload, extraContent = []) {
    return ok({
        content: [...extraContent, { type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
    });
}
//# sourceMappingURL=structured-response.js.map