import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model used when submitting a payment intent to resolve a cart
 */
export class ResolveCartWithPaymentIntentInputDto {
    /**
     * Payment Intent ID containing the payment
     */
    @ApiProperty({
        description: 'Payment Intent to use to resolve the current cart',
    })
    @IsString()
    paymentIntentId: string;
}
