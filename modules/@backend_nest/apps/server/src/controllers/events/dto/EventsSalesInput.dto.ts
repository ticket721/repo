import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when fetching sales info
 */
export class EventsSalesInputDto {
    /**
     * Start date
     */
    @ApiPropertyOptional({
        description: 'Start date of sales to fetch',
    })
    @IsDateString()
    @IsOptional()
    start?: Date;

    /**
     * End date
     */
    @ApiPropertyOptional({
        description: 'End date of sales to fetch',
    })
    @IsDateString()
    @IsOptional()
    end?: Date;
}
