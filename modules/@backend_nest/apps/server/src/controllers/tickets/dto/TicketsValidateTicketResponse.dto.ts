import { GuestInfos } from '@app/server/controllers/events/dto/EventsGuestlistResponse.dto';

/**
 * Data input returned by the ticket validation
 */
export class TicketsValidateTicketResponseDto {
    /**
     * Infos about owner of the ticket
     */
    info: GuestInfos;
}
