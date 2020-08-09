import { IsString }              from 'class-validator';
import { ApiProperty }           from '@nestjs/swagger';

export class PaymentStripeAddExternalAccountInputDto {
    @ApiProperty()
    @IsString()
        // tslint:disable-next-line:variable-name
    bank_account_token: string;
}

