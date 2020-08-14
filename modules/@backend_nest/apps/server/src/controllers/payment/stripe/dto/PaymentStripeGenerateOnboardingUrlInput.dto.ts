import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentStripeGenerateOnboardingUrlInputDto {
    @ApiProperty()
    @IsUrl()
    // tslint:disable-next-line:variable-name
    refresh_url: string;

    @ApiProperty()
    @IsUrl()
    // tslint:disable-next-line:variable-name
    return_url: string;
}
