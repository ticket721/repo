import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoriesAddDateLinkInputDto {
    @ApiProperty()
    @IsUUID()
    date: string;
}
