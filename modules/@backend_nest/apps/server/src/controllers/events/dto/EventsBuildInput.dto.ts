import { ApiProperty } from '@nestjs/swagger';
import { EventCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';

/**
 * Data input for event building. Requires a completed @event/creation action set
 * The actionset will be destroyed
 */
export class EventsBuildInputDto {
    /**
     * New event creation payload
     */
    @ApiProperty({
        description: 'Event creation payload',
    })
    @IsObject()
    eventPayload: EventCreationPayload;
}
