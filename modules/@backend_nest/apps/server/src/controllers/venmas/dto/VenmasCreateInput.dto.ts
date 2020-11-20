import { Sections } from '@lib/common/venmas/entities/Venmas.entity';

/**
 * Data structure required by to create Venmas entity
 */
export class VenmasCreateInputDto {
    /**
     * Venmas entity name
     */
    name: string;

    /**
     * Venmas entity map (Base64 image)
     */
    map: string;

    /**
     * Venmas entity sections
     */
    sections: Sections;
}
