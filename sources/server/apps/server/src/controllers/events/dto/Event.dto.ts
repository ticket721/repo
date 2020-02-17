import { Category } from '@lib/common/dates/entities/Date.entity';

/**
 * Date Model for most of event related calls
 */
export class EventDto {
    /**
     * Unique ID of the Date
     */
    id: string;

    /**
     * Status of the Event
     */
    status: 'preview' | 'deployed';

    /**
     * Validating address
     */
    address: string;

    /**
     * Unique ID of the Owner
     */
    owner: string;

    /**
     * Unique ID of the Admins
     */
    admins: string[];

    /**
     * Unique ID of the Dates
     */
    dates: string[];

    /**
     * Ticket categories that are cross-dates
     */
    categories: Category[];

    /**
     * Name of the event
     */
    name: string;

    /**
     * Description of the event
     */
    description: string;

    /**
     * Avatar image of the event
     */
    avatar: string;

    /**
     * Banner images of the event
     */
    banners: string[];

    /**
     * Description of the event
     */
    // tslint:disable-next-line:variable-name
    group_id: string;

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
