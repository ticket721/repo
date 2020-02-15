import { EIP712Payload } from '@ticket721/e712';

/**
 * Data Model returned when fetching the E712 payload
 */
export class EventsDeployGeneratePayloadResponseDto {
    /**
     * Payload to sign in order to deploy an event
     */
    payload: EIP712Payload;

    /**
     * Assigned Group ID of the event
     */
    groupId: string;
}
