import { IsUUID } from 'class-validator';

/**
 * Data model to recover E712 Payload
 */
export class EventsDeployGeneratePayloadParamsDto {
    /**
     * Event unique UUID
     */
    @IsUUID()
    event: string;
}
