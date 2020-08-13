import { IsString }              from 'class-validator';
import { ApiProperty }           from '@nestjs/swagger';

export class PaymentStripeSetDefaultExternalAccountInputDto {
    @ApiProperty()
    @IsString()
        // tslint:disable-next-line:variable-name
    external_account_id: string;
}

