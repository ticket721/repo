export class NestError extends Error {
    constructor(message?: string) {

        console.warn(`[ ${new Date(Date.now()).toISOString()} | NestError ] ${message}`);

        super(message);
    }
}
