import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventsBindStripeInterfaceInputDto {
    @ApiProperty({
        description: 'Stripe interface id',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    stripe_interface_id: string;
}
