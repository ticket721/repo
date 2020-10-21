import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StripeCheckoutInput {
    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;
}

export class NoneCheckoutInput {
    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;
}

export class PurchasesCheckoutInputDto {
    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => StripeCheckoutInput)
    stripe?: StripeCheckoutInput;

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => NoneCheckoutInput)
    none?: NoneCheckoutInput;
}
