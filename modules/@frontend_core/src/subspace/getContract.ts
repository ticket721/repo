import Subspace from '@embarklabs/subspace';
import contracts from './contract_artifacts.json';

export function getContract(subspace: Subspace, mod: string, contractName: string): any {
    if (!contracts[mod]) {
        throw new Error(`Modules ${mod} not loading into artifacts`);
    }

    console.log(contracts[mod].live);

    if (!contracts[mod].live[`${contractName}.json`]) {
        throw new Error(`Contract ${contractName} not loading into ${mod} module artifacts`);
    }

    const networkId = parseInt(process.env.REACT_APP_ETHEREUM_NETWORK_ID, 10);

    return subspace.contract({
        abi: contracts[mod].live[`${contractName}.json`].abi,
        address: contracts[mod].live[`${contractName}.json`].networks[networkId].address,
    });
}
