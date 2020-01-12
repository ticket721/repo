import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { ActionsSearchInputDto }    from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';

export async function actionsSearch(
    token: string,
    query: ActionsSearchInputDto,
): Promise<AxiosResponse<ActionsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<ActionsSearchInputDto>('/actions/search', {
        Authorization: `Bearer ${token}`,
    }, query);
}
