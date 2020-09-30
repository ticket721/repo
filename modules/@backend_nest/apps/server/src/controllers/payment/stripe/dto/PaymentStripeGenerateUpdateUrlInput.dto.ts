import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Model required when updating an url
 */
export class PaymentStripeGenerateUpdateUrlInputDto {
    /**
     * Refresh url paramter
     */
    @ApiProperty()
    @IsUrl()
    // tslint:disable-next-line:variable-name
    refresh_url: string;

    /**
     * Return url parameter
     */
    @ApiProperty()
    @IsUrl()
    // tslint:disable-next-line:variable-name
    return_url: string;
}
