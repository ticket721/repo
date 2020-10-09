import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EventsStatusInputDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    event?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    dates?: { [key: string]: boolean };

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    categories?: { [key: string]: boolean };
}
