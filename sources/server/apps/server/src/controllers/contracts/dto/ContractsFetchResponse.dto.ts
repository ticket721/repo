import { Contracts } from '@lib/common/contracts/Contracts.service';

/**
 * Data Model returned when fetching contract artifacts
 */
export class ContractsFetchResponseDto {
    /**
     * Contract Artifacts
     */
    contracts: Contracts;
}
