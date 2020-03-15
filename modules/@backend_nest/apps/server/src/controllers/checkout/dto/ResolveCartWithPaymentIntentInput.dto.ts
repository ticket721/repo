import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model used when submitting a payment intent to resolve a cart
 */
export class ResolveCartWithPaymentIntentInputDto {
    /**
     * Payment Intent ID containing the payment
     */
    @ApiProperty()
    @IsString()
    paymentIntentId: string;
}
