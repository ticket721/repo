import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when creating a connect account
 */
export class PaymentStripeCreateConnectAccountInputDto {
    /**
     * Token containing account info
     */
    @ApiProperty()
    @IsString()
    // tslint:disable-next-line:variable-name
    account_token: string;

    /**
     * Default currency for account
     */
    @ApiProperty()
    @IsString()
    currency: string;
}
