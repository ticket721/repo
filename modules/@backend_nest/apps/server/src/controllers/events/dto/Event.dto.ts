/**
 * Date Model for most of event related calls
 */
export class EventDto {
    /**
     * Unique ID of the Date
     */
    id: string;

    /**
     * Event Owner ID
     */
    owner: string;

    /**
     * Event Group ID
     */
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * Validating address
     */
    address: string;

    /**
     * Unique ID of the Dates
     */
    dates: string[];

    /**
     * Name of the event
     */
    name: string;

    /**
     * Creation timestamp
     */
    // tslint:disable-next-line:variable-name
    created_at: Date;

    /**
     * Update timestamp
     */
    // tslint:disable-next-line:variable-name
    updated_at: Date;
}
