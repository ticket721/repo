import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when updating event, date or category statuses
 */
export class EventsStatusInputDto {
    /**
     * Event status
     */
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    event?: boolean;

    /**
     * Internal dates satuses
     */
    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    dates?: { [key: string]: boolean };

    /**
     * Internal categories statuses
     */
    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    categories?: { [key: string]: boolean };
}
