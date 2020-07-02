import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { DosojinSearchInputDto }    from '@app/server/controllers/dosojin/dto/DosojinSearchInput.dto';
import { DosojinSearchResponseDto } from '@app/server/controllers/dosojin/dto/DosojinSearchResponse.dto';
import { DosojinCountInputDto }     from '@app/server/controllers/dosojin/dto/DosojinCountInput.dto';
import { DosojinCountResponseDto }  from '@app/server/controllers/dosojin/dto/DosojinCountResponse.dto';

export async function dosojinSearch(
    token: string,
    query: Partial<DosojinSearchInputDto>,
): Promise<AxiosResponse<DosojinSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<DosojinSearchInputDto>>('/dosojin/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function dosojinCount(
    token: string,
    query: Partial<DosojinCountInputDto>,
): Promise<AxiosResponse<DosojinCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<DosojinCountInputDto>>('/dosojin/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
