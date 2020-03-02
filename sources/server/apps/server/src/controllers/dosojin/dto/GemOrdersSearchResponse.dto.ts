import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

/**
 * Gem Orders Query response
 */
export class GemOrdersSearchResponseDto {
    /**
     * List of Gem Orders matching query
     */
    gemOrders: GemOrderEntity[];
}
