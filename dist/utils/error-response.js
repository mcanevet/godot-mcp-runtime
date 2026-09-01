import { logError } from './logger.js';
/**
 * Return `error.message` when `error` is an `Error`, otherwise `'Unknown error'`.
 * Centralizes the catch-block boilerplate so handlers can build error responses
 * without repeating the `instanceof Error` ternary.
 */
export function getErrorMessage(error) {
    return error instanceof Error ? error.message : 'Unknown error';
}
/**
 * Extract the first [ERROR] message from GDScript stderr output.
 * Falls back to a generic message if no [ERROR] line is found.
 */
export function extractGdError(stderr) {
    const errLine = stderr.split('\n').find((l) => l.includes('[ERROR]'));
    return errLine
        ? errLine.replace(/.*\[ERROR\]\s*/, '').trim()
        : 'see get_debug_output for details';
}
export function createErrorResponse(message, possibleSolutions = []) {
    logError(`Error response: ${message}`);
    if (possibleSolutions.length > 0) {
        logError(`Possible solutions: ${possibleSolutions.join(', ')}`);
    }
    const response = {
        content: [{ type: 'text', text: message }],
        isError: true,
    };
    if (possibleSolutions.length > 0) {
        response.content.push({
            type: 'text',
            text: 'Possible solutions:\n- ' + possibleSolutions.join('\n- '),
        });
    }
    return response;
}
//# sourceMappingURL=error-response.js.map