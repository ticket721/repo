import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model requirement when adding an External Account
 */
export class PaymentStripeAddExternalAccountInputDto {
    /**
     * Stripe Token with External Account info
     */
    @ApiProperty()
    @IsString()
    // tslint:disable-next-line:variable-name
    bank_account_token: string;
}
