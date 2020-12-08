/**
 * Attendee format
 */
export interface Attendee {
    /**
     * Email address
     */
    email: string;

    /**
     * Unique ticket id
     */
    ticket: string;

    /**
     * Ticket category id
     */
    category: string;

    /**
     * Paid price
     */
    price: number;

    /**
     * Currency used
     */
    currency: string;

    /**
     * Date of ticket creation
     */
    date: Date;
}

/**
 * Data model returned when requesting attendees list
 */
export class EventsAttendeesResponseDto {
    /**
     * List of attendees
     */
    attendees: Attendee[];

    /**
     * Used page_size
     */
    // tslint:disable-next-line:variable-name
    page_size: number;

    /**
     * Used page_number
     */
    // tslint:disable-next-line:variable-name
    page_number: number;

    /**
     * Ticket total for the search
     */
    total: number;
}
