import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { ActionsSearchInputDto }    from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionsUpdateInputDto }    from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { ActionsUpdateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';

export async function actionsSearch(
    token: string,
    query: ActionsSearchInputDto,
): Promise<AxiosResponse<ActionsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<ActionsSearchInputDto>('/actions/search', {
        Authorization: `Bearer ${token}`,
    }, query);
}

export async function actionsUpdate(
    token: string,
    query: ActionsUpdateInputDto,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    const self: T721SDK = this;

    return self.put<ActionsUpdateInputDto>('/actions', {
        Authorization: `Bearer ${token}`,
    }, query);
}
