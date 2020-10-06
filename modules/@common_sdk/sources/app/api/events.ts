import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { EventsSearchInputDto }     from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto }  from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventsBuildResponseDto }            from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto }               from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import { EventsStartInputDto }               from '@app/server/controllers/events/dto/EventsStartInput.dto';
import { EventsStartResponseDto }            from '@app/server/controllers/events/dto/EventsStartResponse.dto';
import { EventsUpdateInputDto }              from '@app/server/controllers/events/dto/EventsUpdateInput.dto';
import { EventsUpdateResponseDto }           from '@app/server/controllers/events/dto/EventsUpdateResponse.dto';
import { EventsDeleteCategoriesInputDto }    from '@app/server/controllers/events/dto/EventsDeleteCategoriesInput.dto';
import { EventsDeleteCategoriesResponseDto } from '@app/server/controllers/events/dto/EventsDeleteCategoriesResponse.dto';
import { EventsAddCategoriesInputDto }    from '@app/server/controllers/events/dto/EventsAddCategoriesInput.dto';
import { EventsAddCategoriesResponseDto } from '@app/server/controllers/events/dto/EventsAddCategoriesResponse.dto';
import { EventsDeleteDatesInputDto }      from '@app/server/controllers/events/dto/EventsDeleteDatesInput.dto';
import { EventsDeleteDatesResponseDto }   from '@app/server/controllers/events/dto/EventsDeleteDatesResponse.dto';
import { EventsAddDatesInputDto }         from '@app/server/controllers/events/dto/EventsAddDatesInput.dto';
import { EventsAddDatesResponseDto }      from '@app/server/controllers/events/dto/EventsAddDatesResponse.dto';
import { EventsCountInputDto }            from '@app/server/controllers/events/dto/EventsCountInput.dto';
import { EventsCountResponseDto }         from '@app/server/controllers/events/dto/EventsCountResponse.dto';
import { EventsGuestlistInputDto }        from '@app/server/controllers/events/dto/EventsGuestlistInput.dto';
import { EventsGuestlistResponseDto }     from '@app/server/controllers/events/dto/EventsGuestlistResponse.dto';

export async function eventsSearch(
    token: string,
    query: Partial<EventsSearchInputDto>,
): Promise<AxiosResponse<EventsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<EventsSearchInputDto>>('/events/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsCount(
    token: string,
    query: Partial<EventsCountInputDto>,
): Promise<AxiosResponse<EventsCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<EventsCountInputDto>>('/events/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsCreate(
    token: string,
    query: EventsBuildInputDto,
): Promise<AxiosResponse<EventsBuildResponseDto>> {
    const self: T721SDK = this;

    return self.post<EventsBuildInputDto>('/events', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
export async function eventsStart(
    token: string,
    query: EventsStartInputDto
): Promise<AxiosResponse<EventsStartResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsStartInputDto>('/events/start', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function eventsUpdate(
    token: string,
    event: string,
    query: EventsUpdateInputDto
): Promise<AxiosResponse<EventsUpdateResponseDto>> {

    const self: T721SDK = this;

    return self.put<EventsUpdateInputDto>(`/events/${event}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function eventsDeleteCategories(
    token: string,
    event: string,
    query: EventsDeleteCategoriesInputDto
): Promise<AxiosResponse<EventsDeleteCategoriesResponseDto>> {

    const self: T721SDK = this;

    return self.delete<EventsDeleteCategoriesInputDto>(`/events/${event}/categories`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function eventsAddCategories(
    token: string,
    event: string,
    query: EventsAddCategoriesInputDto
): Promise<AxiosResponse<EventsAddCategoriesResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsAddCategoriesInputDto>(`/events/${event}/categories`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function eventsDeleteDates(
    token: string,
    event: string,
    query: EventsDeleteDatesInputDto
): Promise<AxiosResponse<EventsDeleteDatesResponseDto>> {

    const self: T721SDK = this;

    return self.delete<EventsDeleteDatesInputDto>(`/events/${event}/dates`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function eventsAddDates(
    token: string,
    event: string,
    query: EventsAddDatesInputDto
): Promise<AxiosResponse<EventsAddDatesResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsAddDatesInputDto>(`/events/${event}/dates`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

// export async function eventsWithdraw(
//     token: string,
//     event: string,
//     query: EventsWithdrawInputDto
// ): Promise<AxiosResponse<EventsWithdrawResponseDto>> {
//
//     const self: T721SDK = this;
//
//     return self.post<EventsWithdrawInputDto>(`/events/${event}/withdraw`, {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//     }, query);
// }

export async function eventsGuestlist(
    token: string,
    event: string,
    query: EventsGuestlistInputDto
): Promise<AxiosResponse<EventsGuestlistResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsGuestlistInputDto>(`/events/${event}/guestlist`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
