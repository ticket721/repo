import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoriesAddDateLinksInputDto {
    @ApiProperty({ isArray: true })
    @IsUUID('4', { each: true })
    dates: string[];
}
