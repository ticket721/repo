import { log } from '../log';
const is_address = require('ethereum-address');

export const isAddress = (address: string): boolean => {
    log(`address::isAddress | verifying ${address}`)
    return is_address.isAddress(address);
};
