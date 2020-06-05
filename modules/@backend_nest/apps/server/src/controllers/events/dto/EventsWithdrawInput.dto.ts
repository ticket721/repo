/**
 * Data model required when withdrawing from t721controller
 */
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventsWithdrawInputDto {
    @ApiProperty({
        description: 'Currencies to withdraw',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'Amount to withdraw',
    })
    @IsString()
    amount: string;
}
