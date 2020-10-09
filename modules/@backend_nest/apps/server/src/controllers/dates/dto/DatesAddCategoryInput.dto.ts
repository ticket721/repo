import { CategoryCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DatesAddCategoryInputDto {
    @ApiProperty({
        description: 'Category creation payload',
    })
    @IsObject()
    category: CategoryCreationPayload;
}
