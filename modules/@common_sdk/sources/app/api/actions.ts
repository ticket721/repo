import { AxiosResponse }                   from 'axios';
import { T721SDK }                         from '../../index';
import { ActionsSearchInputDto }           from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto }        from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionsUpdateInputDto }           from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { ActionsUpdateResponseDto }        from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { ActionsCreateInputDto }           from '@app/server/controllers/actionsets/dto/ActionsCreateInput.dto';
import { ActionsCreateResponseDto }        from '@app/server/controllers/actionsets/dto/ActionsCreateResponse.dto';
import { ActionsConsumeUpdateInputDto }    from '@app/server/controllers/actionsets/dto/ActionsConsumeUpdateInput.dto';
import { ActionsConsumeUpdateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsConsumeUpdateResponse.dto';

export async function actionsSearch(
    token: string,
    query: Partial<ActionsSearchInputDto>,
): Promise<AxiosResponse<ActionsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<ActionsSearchInputDto>>('/actions/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function actionsUpdate(
    token: string,
    actionSet: string,
    query: ActionsUpdateInputDto,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    const self: T721SDK = this;

    return self.put<ActionsUpdateInputDto>(`/actions/${actionSet}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function actionsCreate(
    token: string,
    query: ActionsCreateInputDto,
): Promise<AxiosResponse<ActionsCreateResponseDto>> {

    const self: T721SDK = this;

    return self.post<ActionsCreateInputDto>('/actions', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function actionsConsumeUpdate(
    token: string,
    actionSet: string,
    query: ActionsConsumeUpdateInputDto,
): Promise<AxiosResponse<ActionsConsumeUpdateResponseDto>> {

    const self: T721SDK = this;

    return self.put<ActionsConsumeUpdateInputDto>(`/actions/${actionSet}/consume`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

