import { ApiProperty }          from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

/**
 * Input required by the Dates home Search
 */
export class DatesHomeSearchInputDto {
    /**
     * Latitude of the requesting user
     */
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    lat?: number;

    /**
     * Longitude of the requesting user
     */
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    lon?: number;
}
