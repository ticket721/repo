import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model required when removing an External Account
 */
export class PaymentStripeRemoveExternalAccountInputDto {
    /**
     * ID of the external account to remove
     */
    @ApiProperty()
    @IsString()
    // tslint:disable-next-line:variable-name
    external_account_id: string;
}
