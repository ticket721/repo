import { AxiosResponse }                from 'axios';
import { T721SDK }                      from '../../index';
import { GeolocClosestCityInputDto }    from '@app/server/controllers/geoloc/dto/GeolocClosestCityInput.dto';
import { GeolocClosestCityResponseDto } from '@app/server/controllers/geoloc/dto/GeolocClosestCityResponse.dto';
import { GeolocFuzzySearchResponseDto } from '@app/server/controllers/geoloc/dto/GeolocFuzzySearchResponse.dto';
import { GeolocFuzzySearchInputDto }    from '@app/server/controllers/geoloc/dto/GeolocFuzzySearchInput.dto';

export async function geolocClosestCity(
    token: string,
    query: GeolocClosestCityInputDto
): Promise<AxiosResponse<GeolocClosestCityResponseDto>> {
    const self: T721SDK = this;

    return self.post<GeolocClosestCityInputDto>(`/geoloc/closest-city`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function geolocFuzzySearch(
    token: string,
    query: GeolocFuzzySearchInputDto
): Promise<AxiosResponse<GeolocFuzzySearchResponseDto>> {
    const self: T721SDK = this;

    return self.post<GeolocFuzzySearchInputDto>(`/geoloc/fuzzy-search`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}



