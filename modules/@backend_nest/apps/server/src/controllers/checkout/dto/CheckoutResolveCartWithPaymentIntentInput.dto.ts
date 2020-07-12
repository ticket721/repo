import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model used when submitting a payment intent to resolve a cart
 */
export class CheckoutResolveCartWithPaymentIntentInputDto {
    /**
     * ActionSet ID of a complete cart
     */
    @ApiProperty({
        description: 'Action Set ID of the cart to checkout',
    })
    @IsUUID()
    cart: string;

    // /**
    //  * Payment Intent ID to use for the payment
    //  */
    // @ApiProperty({
    //     description: 'Payment Intent ID to create the Payment Intent',
    // })
    // @IsString()
    // paymentIntentId: string;
}
