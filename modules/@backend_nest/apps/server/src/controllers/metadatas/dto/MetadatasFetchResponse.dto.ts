import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';

/**
 * Data model returned when fetching metadatas
 */
export class MetadatasFetchResponseDto {
    /**
     * Metadatas matching query
     */
    metadatas: MetadataEntity[];
}
