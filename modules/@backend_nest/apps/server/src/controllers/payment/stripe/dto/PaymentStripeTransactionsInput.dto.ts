import { IsNumber, IsOptional, IsString }   from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model requirement when recovering transactions
 */
export class PaymentStripeTransactionsInputDto {
    /**
     * Amount of transactions to retrieve
     */
    @ApiProperty()
    @IsNumber()
    limit: number;

    /**
     * Id of transaction that marks the start of results. For pagination
     */
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
        // tslint:disable-next-line:variable-name
    starting_after?: string;
}
