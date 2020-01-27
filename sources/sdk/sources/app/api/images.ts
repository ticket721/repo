import { EventsSearchInputDto }    from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { AxiosResponse }           from 'axios';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { T721SDK }                 from '../../index';

export async function uploadImage(
    token: string,
    formdata: any,
    headers: any,
): Promise<AxiosResponse<EventsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsSearchInputDto>('/images', {
        ...headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data`,
    }, formdata);
}
