import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { ActionsSearchInputDto }    from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { RightsSearchResponseDto }  from '@app/server/controllers/rights/dto/RightsSearchResponse.dto';
import { RightsSearchInputDto }     from '@app/server/controllers/rights/dto/RightsSearchInput.dto';

export async function rightsSearch(
    token: string,
    query: RightsSearchInputDto,
): Promise<AxiosResponse<RightsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<ActionsSearchInputDto>('/rights/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
