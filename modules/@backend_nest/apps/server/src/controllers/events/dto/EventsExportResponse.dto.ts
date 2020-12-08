import { Attendee } from '@app/server/controllers/events/dto/EventsAttendeesResponse.dto';

/**
 * Data model returned when fetching complete export
 */
export class EventsExportResponseDto {
    /**
     * Attendees list
     */
    attendees: Attendee[];

    /**
     * Total number of attendees
     */
    total: number;
}
