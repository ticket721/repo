import { Product } from '@lib/common/purchases/entities/Purchase.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

/**
 * Data model requiring when updating the products in the cart
 */
export class PurchasesSetProductsInputDto {
    /**
     * List of items to override current ones
     */
    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => Product)
    products: Product[];
}
