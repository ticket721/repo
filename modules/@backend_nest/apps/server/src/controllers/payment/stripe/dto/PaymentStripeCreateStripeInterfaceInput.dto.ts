import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentStripeCreateStripeInterfaceInputDto {
    @ApiProperty()
    @IsString()
    // tslint:disable-next-line:variable-name
    account_token: string;
}
