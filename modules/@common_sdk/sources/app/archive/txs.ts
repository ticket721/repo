import { AxiosResponse }           from 'axios';
import { T721SDK }                 from '../../index';
import { TxsSearchResponseDto }    from '@app/server/controllers/txs/dto/TxsSearchResponse.dto';
import { TxsSearchInputDto }       from '@app/server/controllers/txs/dto/TxsSearchInput.dto';
import { TxsSubscribeInputDto }    from '@app/server/controllers/txs/dto/TxsSubscribeInput.dto';
import { TxsInfosResponseDto }     from '@app/server/controllers/txs/dto/TxsInfosResponse.dto';
import { TxsSubscribeResponseDto } from '@app/server/controllers/txs/dto/TxsSubscribeResponse.dto';
import { TxsCountInputDto }        from '@app/server/controllers/txs/dto/TxsCountInput.dto';
import { TxsCountResponseDto }     from '@app/server/controllers/txs/dto/TxsCountResponse.dto';

export async function txsInfos(): Promise<AxiosResponse<TxsInfosResponseDto>> {

    const self: T721SDK = this;

    return self.get('/txs/infos', {
        'Content-Type': 'application/json',
    });
}

export async function txsSearch(
    token: string,
    query: Partial<TxsSearchInputDto>,
): Promise<AxiosResponse<TxsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<TxsSearchInputDto>>('/txs/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function txsCount(
    token: string,
    query: Partial<TxsCountInputDto>,
): Promise<AxiosResponse<TxsCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<TxsCountInputDto>>('/txs/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function txsSubscribe(
    token: string,
    query: TxsSubscribeInputDto,
): Promise<AxiosResponse<TxsSubscribeResponseDto>> {

    const self: T721SDK = this;

    return self.post<TxsSubscribeInputDto>('/txs/subscribe', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

