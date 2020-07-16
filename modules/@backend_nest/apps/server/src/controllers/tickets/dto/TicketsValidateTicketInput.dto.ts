import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model for the ticket validation query
 */
export class TicketsValidateTicketInputDto {
    /**
     * Ticket ID to verify
     */
    @ApiProperty()
    @IsString()
    ticketId: string;

    /**
     * Device Address of the user
     */
    @ApiProperty()
    @IsString()
    address: string;
}
