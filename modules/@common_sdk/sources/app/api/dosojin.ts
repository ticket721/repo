import { AxiosResponse }                    from 'axios';
import { T721SDK }                          from '../../index';
import { DosojinSearchInputDto }            from '@app/server/controllers/dosojin/dto/DosojinSearchInput.dto';
import { DosojinSearchResponseDto }         from '@app/server/controllers/dosojin/dto/DosojinSearchResponse.dto';

export async function dosojinSearch(
    token: string,
    query: DosojinSearchInputDto,
): Promise<AxiosResponse<DosojinSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<DosojinSearchInputDto>('/dosojin/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

