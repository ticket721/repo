import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model to start the event creation process. Creates an ActionSet
 */
export class EventsCreateInputDto {
    /**
     * Name to give to the event
     */
    @ApiProperty()
    @IsString()
    name: string;
}
