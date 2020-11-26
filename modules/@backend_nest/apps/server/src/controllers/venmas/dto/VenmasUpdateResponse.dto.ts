import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';

/**
 * Data model returned when update/deleting a venmas entity
 */
export class VenmasUpdateResponseDto {
    /**
     * Updated/deleted venmas entity
     */
    venmas: VenmasEntity | null;
}