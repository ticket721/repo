import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

export class SearchableField<FieldType> {
    @ApiPropertyOptional({
        description: 'Should equal the provided value',
    })
    @IsOptional()
    $eq?: FieldType;
    @ApiPropertyOptional({
        description: 'Should not equal the provided value',
    })
    $ne?: FieldType;

    @ApiPropertyOptional({
        description: 'Should equal one of the provided values',
        isArray: true,
    })
    @IsArray()
    @IsOptional()
    $in?: [FieldType];
    @ApiPropertyOptional({
        description: 'Should not equal any of the provided values',
        isArray: true,
    })
    @IsArray()
    @IsOptional()
    $nin?: [FieldType];

    @ApiPropertyOptional({
        description: 'Should contain or equal provided value',
    })
    @IsOptional()
    $contains?: FieldType;
    @ApiPropertyOptional({
        description: 'Should not contain or equal provided value',
    })
    @IsOptional()
    $ncontains?: FieldType;

    @ApiPropertyOptional({
        description: 'Should be lower than provided value',
    })
    @IsOptional()
    $lt?: FieldType;
    @ApiPropertyOptional({
        description: 'Should be greater than provided value',
    })
    @IsOptional()
    $gt?: FieldType;

    @ApiPropertyOptional({
        description: 'Should be lower than or equal to the provided value',
    })
    @IsOptional()
    $lte?: FieldType;
    @ApiPropertyOptional({
        description: 'Should be greater than or equal to the provided value',
    })
    @IsOptional()
    $gte?: FieldType;
}
