import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { IsOptional, IsString } from 'class-validator';
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
    @IsOptional()
    name?: string;
}
