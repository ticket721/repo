import { AxiosResponse }           from 'axios';
import { T721SDK }                 from '../../index';
import { VenmasSearchInputDto }    from '@app/server/controllers/venmas/dto/VenmasSearchInput.dto';
import { VenmasSearchResponseDto } from '@app/server/controllers/venmas/dto/VenmasSearchResponse.dto';
import { VenmasEntity }            from '@lib/common/venmas/entities/Venmas.entity';
import { VenmasCreateInputDto }    from '@app/server/controllers/venmas/dto/VenmasCreateInput.dto';

export async function venmasSearch(
    token: string,
    query: Partial<VenmasSearchInputDto>,
): Promise<AxiosResponse<VenmasSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<VenmasSearchInputDto>>('/venmas/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function venmasCreate(
    token: string,
    body: VenmasCreateInputDto,
): Promise<AxiosResponse<void>> {

    const self: T721SDK = this;

    return self.post<VenmasCreateInputDto>('/venmas/create', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, body);
}

export async function venmasUpdate(
    token: string,
    body: VenmasEntity,
    id: string,
): Promise<AxiosResponse<void>> {

    const self: T721SDK = this;

    return self.post<VenmasEntity>(`/venmas/update/${id}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, body);
}

export async function venmasDelete(
    token: string,
    id: string,
): Promise<AxiosResponse<void>> {

    const self: T721SDK = this;

    return self.get(`/venmas/delete/${id}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
}