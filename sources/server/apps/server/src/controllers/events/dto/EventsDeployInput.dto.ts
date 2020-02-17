import { IsObject, IsString, IsUUID } from 'class-validator';
import { EIP712Payload } from '@ticket721/e712';

/**
 * Data Model of the event deployment
 */
export class EventsDeployInputDto {
    /**
     * Payload signed by the user controller wallet
     */
    @IsObject()
    payload: EIP712Payload;

    /**
     * Signature of the payload
     */
    @IsString()
    signature: string;

    /**
     * Event unique UUID
     */
    @IsUUID()
    event: string;
}
