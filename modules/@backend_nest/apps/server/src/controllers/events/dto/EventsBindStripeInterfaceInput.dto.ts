import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when binding a stripe interface to an event
 */
export class EventsBindStripeInterfaceInputDto {
    /**
     * ID of the stripe interface
     */
    @ApiProperty({
        description: 'Stripe interface id',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    stripe_interface_id: string;
}
