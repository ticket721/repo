import { AxiosResponse }              from 'axios';
import { T721SDK }                    from '../../index';
import { EventsSearchInputDto }       from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto }    from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventsBuildResponseDto }     from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto }               from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import { EventsCountInputDto }                  from '@app/server/controllers/events/dto/EventsCountInput.dto';
import { EventsCountResponseDto }               from '@app/server/controllers/events/dto/EventsCountResponse.dto';
import { EventsGuestlistInputDto }              from '@app/server/controllers/events/dto/EventsGuestlistInput.dto';
import { EventsGuestlistResponseDto }           from '@app/server/controllers/events/dto/EventsGuestlistResponse.dto';
import { EventsAddDateInputDto }                from '@app/server/controllers/events/dto/EventsAddDateInput.dto';
import { EventsAddDateResponseDto }             from '@app/server/controllers/events/dto/EventsAddDateResponse.dto';
import { EventsEditInputDto }                   from '@app/server/controllers/events/dto/EventsEditInput.dto';
import { EventsEditResponseDto }                from '@app/server/controllers/events/dto/EventsEditResponse.dto';
import { EventsStatusResponseDto }              from '@app/server/controllers/events/dto/EventsStatusResponse.dto';
import { EventsStatusInputDto }                 from '@app/server/controllers/events/dto/EventsStatusInput.dto';
import { EventsBindStripeInterfaceInputDto }    from '@app/server/controllers/events/dto/EventsBindStripeInterfaceInput.dto';
import { EventsBindStripeInterfaceResponseDto } from '@app/server/controllers/events/dto/EventsBindStripeInterfaceResponse.dto';
import { EventsOwnerResponseDto }               from '@app/server/controllers/events/dto/EventsOwnerResponse.dto';
import { EventsAttendeesInputDto }              from '@app/server/controllers/events/dto/EventsAttendeesInput.dto';
import { EventsAttendeesResponseDto }           from '@app/server/controllers/events/dto/EventsAttendeesResponse.dto';
import { EventsExportInputDto }                 from '@app/server/controllers/events/dto/EventsExportInput.dto';
import { EventsExportResponseDto }              from '@app/server/controllers/events/dto/EventsExportResponse.dto';
import { EventsSalesInputDto }                  from '@app/server/controllers/events/dto/EventsSalesInput.dto';
import { EventsSalesResponseDto }               from '@app/server/controllers/events/dto/EventsSalesResponse.dto';

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

export async function eventsSales(
    token: string,
    event: string,
    query: Partial<EventsSalesInputDto>,
): Promise<AxiosResponse<EventsSalesResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<EventsSalesInputDto>>(`/events/${event}/sales`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsExport(
    token: string,
    event: string,
    query: Partial<EventsExportInputDto>,
): Promise<AxiosResponse<EventsExportResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<EventsAttendeesInputDto>>(`/events/${event}/export`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsAttendees(
    token: string,
    event: string,
    query: Partial<EventsAttendeesInputDto>,
): Promise<AxiosResponse<EventsAttendeesResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<EventsAttendeesInputDto>>(`/events/${event}/attendees`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsOwner(
    token: string,
    event: string
): Promise<AxiosResponse<EventsOwnerResponseDto>> {

    const self: T721SDK = this;

    return self.get(`/events/owner/${event}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
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

export async function eventsStatus(
    token: string,
    event: string,
    query: EventsStatusInputDto,
): Promise<AxiosResponse<EventsStatusResponseDto>> {
    const self: T721SDK = this;

    return self.put<EventsStatusInputDto>(`/events/${event}/status`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsBindStripeInterface(
    token: string,
    event: string,
    query: EventsBindStripeInterfaceInputDto,
): Promise<AxiosResponse<EventsBindStripeInterfaceResponseDto>> {
    const self: T721SDK = this;

    return self.post<EventsBindStripeInterfaceInputDto>(`/events/${event}/bind-stripe-interface`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsAddDate(
    token: string,
    event: string,
    query: EventsAddDateInputDto,
): Promise<AxiosResponse<EventsAddDateResponseDto>> {
    const self: T721SDK = this;

    return self.post<EventsAddDateInputDto>(`/events/${event}/date`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsEdit(
    token: string,
    event: string,
    query: EventsEditInputDto,
): Promise<AxiosResponse<EventsEditResponseDto>> {
    const self: T721SDK = this;
    return self.put<EventsEditInputDto>(`/events/${event}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

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
