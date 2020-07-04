import Subspace from '@embarklabs/subspace';
import { useRequest } from '../hooks/useRequest';
import { ContractsFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/contracts/dto/ContractsFetchResponse.dto';

export interface SubspaceContractResponse {
    contract: any;
    error: any;
    loading: boolean;
}

export function getContract(
    subspace: Subspace,
    mod: string,
    contractName: string,
    uuid: string,
): SubspaceContractResponse {
    const contractsReq = useRequest<ContractsFetchResponseDto>(
        {
            method: 'contracts.fetch',
            args: [],
            refreshRate: 1000,
        },
        uuid,
    );

    if (contractsReq.response.error || contractsReq.response.loading) {
        return {
            loading: contractsReq.response.loading,
            error: contractsReq.response.error,
            contract: null,
        };
    }

    const serverResponse = contractsReq.response.data.contracts;
    const completeContractName = `${mod}::${contractName}`;

    if (!serverResponse[completeContractName]) {
        throw new Error(`Cannot find contract ${completeContractName}`);
    }

    return {
        loading: false,
        error: null,
        contract: subspace.contract({
            address: serverResponse[completeContractName].address,
            abi: serverResponse[completeContractName].abi,
        }),
    };
}
