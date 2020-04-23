/**
 * Utility to work with Dates, timestamps etc
 */
export class TimeToolService {
    /**
     * Recover the current timestamp
     */
    /* istanbul ignore next */
    now(): Date {
        return new Date(Date.now());
    }
}
