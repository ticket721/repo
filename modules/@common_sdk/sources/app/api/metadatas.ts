import { AxiosResponse }             from 'axios';
import { T721SDK }                   from '../../index';
import { MetadatasFetchInputDto }    from '@app/server/controllers/metadatas/dto/MetadatasFetchInput.dto';
import { MetadatasFetchResponseDto } from '@app/server/controllers/metadatas/dto/MetadatasFetchResponse.dto';

export async function metadatasFetch(
    token: string,
    query: MetadatasFetchInputDto,
): Promise<AxiosResponse<MetadatasFetchResponseDto>> {

    const self: T721SDK = this;

    return self.post<MetadatasFetchInputDto>('/metadatas/fetch', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
