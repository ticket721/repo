import { log }      from '../log';
import * as HashLib from 'js-sha3';

const hexReg = /^[abcdefABCDEF0123456789]+$/;
const hashLength = 64;

export const isKeccak256 = (hash: string): boolean => {
    log(`address::isKeccak256 | verifying ${hash}`);

    if (hash.length === hashLength + 2) {
        hash = hash.slice(2);
    } else if (hash.length !== hashLength) {
        return false;
    }

    return hexReg.test(hash);
};

export const toAcceptedKeccak256Format = (hash: string): string => {
    log(`address::toAcceptedKeccak256Format | formatting ${hash}`);
    if (!isKeccak256(hash)) {
        return null;
    }

    if (hash.length === hashLength) {
        hash = `0x${hash}`;
    }

    return hash.toLowerCase();
};

export const keccak256 = (data: string): string => {
    return toAcceptedKeccak256Format(HashLib.keccak_256(data));
};
