import { DateEntity, DateMetadata, DateTimestamps, InputDateLocation } from '@lib/common/dates/entities/Date.entity';
import { IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when updating date
 */
export class DatesUpdateInputDto implements Partial<Pick<DateEntity, 'timestamps' | 'metadata'>> {
    /**
     * Edits location info
     */
    @ApiPropertyOptional({
        description: 'Edits the location information',
    })
    @ValidateNested()
    @Type(() => InputDateLocation)
    @ValidateIf((_, v) => v !== undefined)
    location?: InputDateLocation;

    /**
     * Edits timestamps info
     */
    @ApiPropertyOptional({
        description: 'Edits the timestamps information',
    })
    @ValidateNested()
    @Type(() => DateTimestamps)
    @ValidateIf((_, v) => v !== undefined)
    timestamps?: DateTimestamps;

    /**
     * Edits metadata info
     */
    @ApiPropertyOptional({
        description: 'Edits the metadata information',
    })
    @ValidateNested()
    @Type(() => DateMetadata)
    @ValidateIf((_, v) => v !== undefined)
    metadata?: DateMetadata;
}
