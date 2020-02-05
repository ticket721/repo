import { formatBytes32String } from 'ethers/utils';

export function uuidEq(uuid1: string, uuid2: string): boolean {
    return uuid1.toLowerCase() === uuid2.toLowerCase();
}

export function toB32(text: string): string {
    return formatBytes32String(text).toLowerCase();
}
