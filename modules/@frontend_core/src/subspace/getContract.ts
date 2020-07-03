import Subspace from '@embarklabs/subspace';
import contracts from './contract_artifacts.json';
import { getEnv } from '../utils/getEnv';

export function getContract(subspace: Subspace, mod: string, contractName: string): any {
    if (!contracts[mod]) {
        throw new Error(`Modules ${mod} not loading into artifacts`);
    }

    if (!contracts[mod][`${contractName}.json`]) {
        throw new Error(`Contract ${contractName} not loading into ${mod} module artifacts`);
    }

    const networkId = parseInt(getEnv().REACT_APP_ETHEREUM_NETWORK_ID, 10);

    return subspace.contract({
        abi: contracts[mod][`${contractName}.json`].abi,
        address: contracts[mod][`${contractName}.json`].networks[networkId].address,
    });
}
