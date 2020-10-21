import { Product } from '@lib/common/purchases/entities/Purchase.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class PurchasesSetProductsInputDto {
    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => Product)
    products: Product[];
}
