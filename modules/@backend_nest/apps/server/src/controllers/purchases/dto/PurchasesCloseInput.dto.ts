import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Data model required when closing the purchase
 */
export class PurchasesCloseInputDto {
    /**
     * Action url for purchase summary email
     */
    @ApiProperty()
    @IsString()
    @IsOptional()
    mailActionUrl?: string;
}
