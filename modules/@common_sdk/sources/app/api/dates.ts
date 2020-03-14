import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { DatesSearchInputDto }      from '@app/server/controllers/dates/dto/DatesSearchInput.dto';
import { DatesSearchResponseDto }   from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';

export async function datesSearch(
    token: string,
    query: DatesSearchInputDto,
): Promise<AxiosResponse<DatesSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<DatesSearchInputDto>('/dates/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
