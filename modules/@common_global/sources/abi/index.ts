import {utils}       from 'ethers';
import { AbiCoder }  from 'ethers/utils';
import { keccak256 } from '../hash';

export function encode(types: string[], values: any[]): string {
    const encoder: AbiCoder = utils.defaultAbiCoder;

    return encoder.encode(types, values);
}

export function getT721ControllerGroupID(uuid: string, address: string): string {
    return keccak256(encode(['address', 'string'], [address, uuid.toString().toLowerCase()])).toLowerCase();
}
