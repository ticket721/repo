/**
 * Map holding names of calls currently running
 */
const runningMap: { [key: string]: boolean } = {};

/**
 * Reusable helper to prevent scheduled calls from being called concurrently
 *
 * @param name
 * @param fn
 */
export async function noConcurrentRun(name: string, fn: () => Promise<void>): Promise<void> {
    if (!runningMap[name]) {
        runningMap[name] = true;
        let error = null;

        try {
            await fn();
        } catch (e) {
            error = e;
        }

        runningMap[name] = false;

        if (error) {
            throw error;
        }
    }
}
