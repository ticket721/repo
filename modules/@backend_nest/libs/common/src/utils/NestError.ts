/**
 * Wrapper Error to log any sort of throw happening in the platform
 */
export class NestError extends Error {
    /**
     * Error Builder
     *
     * @param message
     */
    constructor(message?: string) {
        super(message);
        console.warn(`[ ${new Date(Date.now()).toISOString()} | NestError ] ${message}`);
        console.warn(this.stack);
    }
}
