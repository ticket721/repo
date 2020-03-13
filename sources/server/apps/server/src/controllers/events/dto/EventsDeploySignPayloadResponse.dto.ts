import { EIP712Payload } from '@ticket721/e712';

/**
 * Data Model returned when fetching the E712 payload and its signature
 */
export class EventsDeploySignPayloadResponseDto {
    /**
     * Payload to sign in order to deploy an event
     */
    payload: EIP712Payload;

    /**
     * Assigned Group ID of the event
     */
    groupId: string;

    /**
     * Signature of the payload
     */
    signature: string;
}
