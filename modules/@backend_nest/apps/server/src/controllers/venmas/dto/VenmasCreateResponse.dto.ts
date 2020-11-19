import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';

/**
 * Ticket search query result
 */
export class VenmasCreateResponseDto {
    /**
     * Venmas entity matching query
     */
    venmas: VenmasEntity;
}
