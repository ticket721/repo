import { AxiosResponse }           from 'axios';
import { T721SDK }                 from '../../index';
import { EventsSearchInputDto }    from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventsCreateInputDto }    from '@app/server/controllers/events/dto/EventsCreateInput.dto';
import { EventsCreateResponseDto } from '@app/server/controllers/events/dto/EventsCreateResponse.dto';

export async function eventsSearch(
    token: string,
    query: EventsSearchInputDto,
): Promise<AxiosResponse<EventsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsSearchInputDto>('/events/search', {
        Authorization: `Bearer ${token}`,
    }, query);
}

export async function eventsCreate(
    token: string,
    query: EventsCreateInputDto,
): Promise<AxiosResponse<EventsCreateResponseDto>> {
    const self: T721SDK = this;

    return self.post<EventsCreateInputDto>('/events', {
        Authorization: `Bearer ${token}`,
    }, query);
}
