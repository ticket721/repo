import { RightEntity } from '@lib/common/rights/entities/Right.entity';

/**
 * Rights Query response
 */
export class RightsSearchResponseDto {
    /**
     * List of Rights matching query
     */
    rights: RightEntity[];
}
