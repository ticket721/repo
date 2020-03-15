import { IsUUID } from 'class-validator';

/**
 * Data model to recover E712 Payload and its signature
 */
export class EventsDeploySignPayloadParamsDto {
    /**
     * Event unique UUID
     */
    @IsUUID()
    event: string;
}
