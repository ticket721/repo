import { IsString }              from 'class-validator';
import { ApiProperty }           from '@nestjs/swagger';

export class PaymentStripeRemoveExternalAccountInputDto {
    @ApiProperty()
    @IsString()
        // tslint:disable-next-line:variable-name
    external_account_id: string;
}

