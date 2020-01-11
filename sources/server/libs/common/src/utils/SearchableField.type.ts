import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

export class SearchableField<FieldType> {
    @ApiPropertyOptional({
        description: 'Should equal the provided value',
        example: null,
    })
    @IsOptional()
    $eq?: FieldType;
    @ApiPropertyOptional({
        description: 'Should not equal the provided value',
        example: null,
    })
    $ne?: FieldType;

    @ApiPropertyOptional({
        description: 'Should equal one of the provided values',
        isArray: true,
        example: null,
    })
    @IsArray()
    @IsOptional()
    $in?: [FieldType];
    @ApiPropertyOptional({
        description: 'Should not equal any of the provided values',
        isArray: true,
        example: null,
    })
    @IsArray()
    @IsOptional()
    $nin?: [FieldType];

    @ApiPropertyOptional({
        description: 'Should contain or equal provided value',
        example: null,
    })
    @IsOptional()
    $contains?: FieldType;
    @ApiPropertyOptional({
        description: 'Should not contain or equal provided value',
        example: null,
    })
    @IsOptional()
    $ncontains?: FieldType;

    @ApiPropertyOptional({
        description: 'Should be lower than provided value',
        example: null,
    })
    @IsOptional()
    $lt?: FieldType;
    @ApiPropertyOptional({
        description: 'Should be greater than provided value',
        example: null,
    })
    @IsOptional()
    $gt?: FieldType;

    @ApiPropertyOptional({
        description: 'Should be lower than or equal to the provided value',
        example: null,
    })
    @IsOptional()
    $lte?: FieldType;
    @ApiPropertyOptional({
        description: 'Should be greater than or equal to the provided value',
        example: null,
    })
    @IsOptional()
    $gte?: FieldType;
}
