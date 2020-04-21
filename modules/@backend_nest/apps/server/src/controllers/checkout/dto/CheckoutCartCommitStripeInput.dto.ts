import { IsUUID } from 'class-validator';

export class CheckoutCartCommitStripeInputDto {
    @IsUUID()
    cart: string;
}
