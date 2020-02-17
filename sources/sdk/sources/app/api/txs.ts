import { AxiosResponse }        from 'axios';
import { T721SDK }              from '../../index';
import { TxsSearchResponseDto } from '@app/server/controllers/txs/dto/TxsSearchResponse.dto';
import { TxsSearchInputDto }    from '@app/server/controllers/txs/dto/TxsSearchInput.dto';
import { TxsSubscribeInputDto } from '@app/server/controllers/txs/dto/TxsSubscribeInput.dto';
import { TxsInfosResponseDto }  from '@app/server/controllers/txs/dto/TxsInfosResponse.dto';
import { TxsMtxInputDto }       from '@app/server/controllers/txs/dto/TxsMtxInput.dto';
import { TxsMtxResponseDto }    from '@app/server/controllers/txs/dto/TxsMtxResponse.dto';

export async function txsInfos(): Promise<AxiosResponse<TxsInfosResponseDto>> {

    const self: T721SDK = this;

    return self.get('/txs/infos', {
        'Content-Type': 'application/json',
    });
}

export async function txsSearch(
    token: string,
    query: TxsSearchInputDto,
): Promise<AxiosResponse<TxsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<TxsSearchInputDto>('/txs/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function txsSubscribe(
    token: string,
    query: TxsSubscribeInputDto,
): Promise<AxiosResponse<TxsSubscribeInputDto>> {

    const self: T721SDK = this;

    return self.post<TxsSubscribeInputDto>('/txs/subscribe', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function metaTx(
    token: string,
    query: TxsMtxInputDto,
): Promise<AxiosResponse<TxsMtxResponseDto>> {

    const self: T721SDK = this;

    return self.post<TxsMtxInputDto>('/txs/mtx', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
