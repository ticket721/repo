import { DateEntity, DateLocation, DateMetadata, DateTimestamps } from '@lib/common/dates/entities/Date.entity';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when updating date
 */
export class DatesUpdateInputDto implements Partial<Pick<DateEntity, 'location' | 'timestamps' | 'metadata'>> {
    /**
     * Edits location info
     */
    @ApiPropertyOptional({
        description: 'Edits the location information',
    })
    @ValidateNested()
    @Type(() => DateLocation)
    @IsOptional()
    location?: DateLocation;

    /**
     * Edits timestamps info
     */
    @ApiPropertyOptional({
        description: 'Edits the timestamps information',
    })
    @ValidateNested()
    @Type(() => DateTimestamps)
    @IsOptional()
    timestamps?: DateTimestamps;

    /**
     * Edits metadata info
     */
    @ApiPropertyOptional({
        description: 'Edits the metadata information',
    })
    @ValidateNested()
    @Type(() => DateMetadata)
    @IsOptional()
    metadata?: DateMetadata;
}
