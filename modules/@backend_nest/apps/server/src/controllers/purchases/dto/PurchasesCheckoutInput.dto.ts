import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Required arguments to checkout with a stripe interface
 */
export class StripeCheckoutInput {}

/**
 * Required arguments to checkout with a none interface
 */
export class NoneCheckoutInput {}

/**
 * Data model required when proceeding to checkout
 */
export class PurchasesCheckoutInputDto {
    /**
     * Data model required when using a stripe payment method
     */
    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => StripeCheckoutInput)
    stripe?: StripeCheckoutInput;

    /**
     * Payment model required when using a none payment method
     */
    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => NoneCheckoutInput)
    none?: NoneCheckoutInput;
}
