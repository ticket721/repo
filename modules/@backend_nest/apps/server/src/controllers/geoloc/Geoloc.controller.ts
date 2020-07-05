import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { GeolocClosestCityInputDto } from '@app/server/controllers/geoloc/dto/GeolocClosestCityInput.dto';
import { GeolocClosestCityResponseDto } from '@app/server/controllers/geoloc/dto/GeolocClosestCityResponse.dto';
import { closestCity, fuzzySearch } from '@common/geoloc';
import { GeolocFuzzySearchInputDto } from '@app/server/controllers/geoloc/dto/GeolocFuzzySearchInput.dto';
import { GeolocFuzzySearchResponseDto } from '@app/server/controllers/geoloc/dto/GeolocFuzzySearchResponse.dto';

/**
 * Geoloc controller to fetch cities
 */
@ApiTags('geoloc')
@Controller('geoloc')
export class GeolocController {
    /**
     * Search for the closest possible city from one set of coords
     *
     * @param body
     */
    @Post('/closest-city')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async closestCity(@Body() body: GeolocClosestCityInputDto): Promise<GeolocClosestCityResponseDto> {
        const result = closestCity({
            lon: body.lon,
            lat: body.lat,
        });

        return {
            city: result,
        };
    }

    /**
     * Search for the cities matching the given query
     *
     * @param body
     */
    @Post('/fuzzy-search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async fuzzySearch(@Body() body: GeolocFuzzySearchInputDto): Promise<GeolocFuzzySearchResponseDto> {
        const results = fuzzySearch(body.query, body.limit);

        return {
            cities: results,
        };
    }
}
