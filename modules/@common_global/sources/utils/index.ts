import { BigNumber, formatBytes32String } from 'ethers/utils';

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

/**
 * Left pads string
 *
 * @param text
 * @param length
 * @param character
 */
export function leftPad(text: string, length: number, character: string = '0'): string {
    if (text.length > length) {
        return text;
    }
    return `${character.repeat(length - text.length)}${text}`;
}

/**
 * Serialize string to remove all whitespace and replace them with _
 *
 * @param text
 */
export function serialize(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s/g, '_')
}

export function isFutureDateRange(begin: Date, end: Date): boolean {
    return ((end.getTime() > begin.getTime()) && (begin.getTime() > Date.now()));
}

export function toHex(data: string): string {
    return '0x' + Buffer.from(data, 'utf8').toString('hex')
}

export function decimalToHex(num: string): string {

    return new BigNumber(num).toHexString()

}
