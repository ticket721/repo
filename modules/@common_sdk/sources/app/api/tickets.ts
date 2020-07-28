import { AxiosResponse }                    from 'axios';
import { T721SDK }                          from '../../index';
import { TicketsSearchInputDto }            from '@app/server/controllers/tickets/dto/TicketsSearchInput.dto';
import { TicketsSearchResponseDto }         from '@app/server/controllers/tickets/dto/TicketsSearchResponse.dto';
import { TicketsCountInputDto }             from '@app/server/controllers/tickets/dto/TicketsCountInput.dto';
import { TicketsCountResponseDto }          from '@app/server/controllers/tickets/dto/TicketsCountResponse.dto';
import { TicketsValidateTicketResponseDto } from '@app/server/controllers/tickets/dto/TicketsValidateTicketResponse.dto';
import { TicketsValidateTicketInputDto }    from '@app/server/controllers/tickets/dto/TicketsValidateTicketInput.dto';

export async function ticketsSearch(
    token: string,
    query: Partial<TicketsSearchInputDto>,
): Promise<AxiosResponse<TicketsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<TicketsSearchInputDto>>('/tickets/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function ticketsCount(
    token: string,
    query: Partial<TicketsCountInputDto>,
): Promise<AxiosResponse<TicketsCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<TicketsCountInputDto>>('/tickets/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function ticketsValidate(
    token: string,
    eventId: string,
    query: TicketsValidateTicketInputDto
): Promise<AxiosResponse<TicketsValidateTicketResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<TicketsValidateTicketInputDto>>(`/tickets/${eventId}/validate-ticket`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
