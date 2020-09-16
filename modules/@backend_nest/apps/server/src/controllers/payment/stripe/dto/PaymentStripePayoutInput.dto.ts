import { IsNumber, IsString } from 'class-validator';
import { ApiProperty }        from '@nestjs/swagger';

/**
 * Data model requirement when triggering a payout
 */
export class PaymentStripePayoutInputDto {
    /**
     * Amount to withdraw
     */
    @ApiProperty()
    @IsNumber()
    amount: number;

    /**
     * Destination External Account
     */
    @ApiProperty()
    @IsString()
    destination: string;

    /**
     * Currency
     */
    @ApiProperty()
    @IsString()
    currency: string;
}
