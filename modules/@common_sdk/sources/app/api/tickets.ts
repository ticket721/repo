import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { TicketsSearchInputDto }    from '@app/server/controllers/tickets/dto/TicketsSearchInput.dto';
import { TicketsSearchResponseDto } from '@app/server/controllers/tickets/dto/TicketsSearchResponse.dto';

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

