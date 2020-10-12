import { CategoryCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoriesEditInputDto {
    @ApiProperty({
        description: 'Category edition payload',
    })
    @IsObject()
    category: Partial<CategoryCreationPayload>;
}
