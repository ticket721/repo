/**
 * Minimal object to build an interface with a smart contract
 */
export interface MinimalContractSpec {
    /**
     * Address of the contract
     */
    address: string;

    /**
     * ABI interface
     */
    abi: any;

    /**
     * Hash of the deployment transaction
     */
    transactionHash: string;
}

/**
 * Data Model returned when fetching contract artifacts
 */
export class ContractsFetchResponseDto {
    /**
     * Contract Artifacts
     */
    contracts: { [key: string]: MinimalContractSpec };
}
