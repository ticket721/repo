import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

/**
 * Upgrades an Input Dto field to accept query arguments
 */
export class SearchableField<FieldType> {
    /**
     * Equality requirement
     */
    @ApiPropertyOptional({
        description: 'Should equal the provided value',
        example: null,
    })
    @IsOptional()
    $eq?: FieldType;

    /**
     * Non-equality requirement
     */
    @ApiPropertyOptional({
        description: 'Should not equal the provided value',
        example: null,
    })
    @IsOptional()
    $ne?: FieldType;

    /**
     * Inclusion requirement
     */
    @ApiPropertyOptional({
        description: 'Should equal one of the provided values',
        isArray: true,
        example: null,
    })
    @IsArray()
    @IsOptional()
    $in?: [FieldType];

    /**
     * Non-inclusion requirement
     */
    @ApiPropertyOptional({
        description: 'Should not equal any of the provided values',
        isArray: true,
        example: null,
    })
    @IsArray()
    @IsOptional()
    $nin?: [FieldType];

    /**
     * Sub-Content equality requirement
     */
    @ApiPropertyOptional({
        description: 'Should contain or equal provided value',
        example: null,
    })
    @IsOptional()
    $contains?: FieldType;

    /**
     * Sub-COntent non-equality requirement
     */
    @ApiPropertyOptional({
        description: 'Should not contain or equal provided value',
        example: null,
    })
    @IsOptional()
    $ncontains?: FieldType;

    /**
     * Lower-Than requirement
     */
    @ApiPropertyOptional({
        description: 'Should be lower than provided value',
        example: null,
    })
    @IsOptional()
    $lt?: FieldType;

    /**
     * Greater-Than requirement
     */
    @ApiPropertyOptional({
        description: 'Should be greater than provided value',
        example: null,
    })
    @IsOptional()
    $gt?: FieldType;

    /**
     * Lower-Than-or-Equal requirement
     */
    @ApiPropertyOptional({
        description: 'Should be lower than or equal to the provided value',
        example: null,
    })
    @IsOptional()
    $lte?: FieldType;

    /**
     * Greater-Than-or-Equal requirement
     */
    @ApiPropertyOptional({
        description: 'Should be greater than or equal to the provided value',
        example: null,
    })
    @IsOptional()
    $gte?: FieldType;
}
