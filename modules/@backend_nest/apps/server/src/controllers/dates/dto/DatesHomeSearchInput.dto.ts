import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/**
 * Input required by the Dates home Search
 */
export class DatesHomeSearchInputDto {
    /**
     * Latitude of the requesting user
     */
    @ApiProperty()
    @IsNumber()
    lat: number;

    /**
     * Longitude of the requesting user
     */
    @ApiProperty()
    @IsNumber()
    lon: number;
}
