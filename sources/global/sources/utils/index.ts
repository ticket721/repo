import { formatBytes32String } from 'ethers/utils';

/**
 * Performs an equality check on two uuid strings
 *
 * @param uuid1
 * @param uuid2
 */
export function uuidEq(uuid1: string, uuid2: string): boolean {
    return uuid1.toLowerCase() === uuid2.toLowerCase();
}

/**
 * Converts a string to Bytes32 format
 *
 * @param text
 */
export function toB32(text: string): string {
    return formatBytes32String(text).toLowerCase();
}
