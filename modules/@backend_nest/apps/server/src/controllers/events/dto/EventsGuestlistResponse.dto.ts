/**
 * Data returned for each guest
 */
export interface GuestInfos {
    /**
     * Ethereum address of the user
     */
    address: string;

    /**
     * Username of the user
     */
    username: string;

    /**
     * Email of the user
     */
    email: string;

    /**
     * Ticket ID of the user
     */
    ticket: string;

    /**
     * Category ID of the ticket
     */
    category: string;
}

/**
 * Data model returned when auerying for a guest list
 */
export class EventsGuestlistResponseDto {
    /**
     * List of guests
     */
    guests: GuestInfos[];
}
