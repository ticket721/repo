import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when withdrawing from t721controller
 */
export class EventsWithdrawInputDto {
    /**
     * Currency to withdraw
     */
    @ApiProperty({
        description: 'Currencies to withdraw',
    })
    @IsString()
    currency: string;

    /**
     * Amount to withdraw
     */
    @ApiProperty({
        description: 'Amount to withdraw',
    })
    @IsString()
    amount: string;
}
