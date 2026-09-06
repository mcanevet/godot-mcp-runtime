// Debug mode from environment
export const DEBUG_MODE = process.env.DEBUG === 'true';
export function logDebug(message) {
    if (DEBUG_MODE) {
        console.error(`[DEBUG] ${message}`);
    }
}
export function logError(message) {
    console.error(`[SERVER] ${message}`);
}
//# sourceMappingURL=logger.js.map