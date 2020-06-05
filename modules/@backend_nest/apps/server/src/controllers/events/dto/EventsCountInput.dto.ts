import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

/**
 * Data model for the event search query
 */
export class EventsCountInputDto {
    /**
     * Query by events id
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Date',
    })
    @IsOptional()
    @IsObject()
    id?: SearchableField<string>;

    /**
     * Query by events name
     */
    @ApiPropertyOptional({
        description: 'Name of the event',
    })
    @IsOptional()
    @IsObject()
    name?: SearchableField<string>;
}