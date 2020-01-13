/**
 * Utility to prevent 0 values from being considered undefined
 *
 * @param val
 */
export function defined(val: any): boolean {
    return val !== null && val !== undefined;
}
