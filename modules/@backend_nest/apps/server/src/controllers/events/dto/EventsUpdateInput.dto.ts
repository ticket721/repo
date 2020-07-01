import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when updating event
 */
export class EventsUpdateInputDto implements Partial<Pick<EventEntity, 'name'>> {
    /**
     * Edits the event name
     */
    @ApiPropertyOptional({
        description: 'Edits event name',
    })
    @IsString()
    @ValidateIf((_, v) => v !== undefined)
    name?: string;
}
