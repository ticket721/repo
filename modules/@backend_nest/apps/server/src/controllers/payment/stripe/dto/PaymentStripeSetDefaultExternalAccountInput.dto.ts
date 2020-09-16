import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model required when setting default account for currency
 */
export class PaymentStripeSetDefaultExternalAccountInputDto {
    /**
     * External Account to define as default for its currency
     */
    @ApiProperty()
    @IsString()
    // tslint:disable-next-line:variable-name
    external_account_id: string;
}
