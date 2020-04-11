import { IsString } from 'class-validator';

/**
 * Link Type
 */
export class Link {
    /**
     * ID of the linked entity
     */
    @IsString()
    id: string;

    /**
     * Entity type
     */
    @IsString()
    type: string;

    /**
     * Field where the id can be found on the entity
     */
    @IsString()
    field: string;
}
