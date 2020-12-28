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
    @IsUrl({
        require_tld: false,
    })
    // tslint:disable-next-line:variable-name
    refresh_url: string;

    /**
     * Return url parameter
     */
    @ApiProperty()
    @IsUrl({
        require_tld: false,
    })
    // tslint:disable-next-line:variable-name
    return_url: string;
}
