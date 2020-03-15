import { log }   from '../log';
import { utils } from 'ethers';

import * as is_address from 'ethereum-address';

export const isAddress = (address: string): boolean => {
    log(`address::isAddress | verifying ${address}`);
    return is_address.isAddress(address);
};

export const toAcceptedAddressFormat = (address: string): string => {
    log(`address::toAcceptedAddressFormat | formatting ${address}`);
    if (!isAddress(address)) {
        return null;
    }

    if (address.length === 40) {
        address = `0x${address}`;
    }

    return utils.getAddress(address);
};
