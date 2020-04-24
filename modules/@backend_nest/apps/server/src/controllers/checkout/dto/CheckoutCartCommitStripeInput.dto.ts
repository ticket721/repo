import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when commiting a cart to a stripe checkout
 */
export class CheckoutCartCommitStripeInputDto {
    /**
     * Action Set ID of the cart
     */
    @ApiProperty({
        description: 'Action Set ID of the cart',
    })
    @IsUUID()
    cart: string;
}
