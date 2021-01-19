import { AxiosResponse }                     from 'axios';
import { T721SDK }                           from '../../index';
import { InvitationsSearchInputDto }         from '@app/server/controllers/invitations/dto/InvitationsSearchInput.dto';
import { InvitationsSearchResponseDto }      from '@app/server/controllers/invitations/dto/InvitationsSearchResponse.dto';
import { InvitationsOwnedSearchInputDto }    from '@app/server/controllers/invitations/dto/InvitationsOwnedSearchInput.dto';
import { InvitationsOwnedSearchResponseDto } from '@app/server/controllers/invitations/dto/InvitationsOwnedSearchResponse.dto';
import { InvitationsCreateInputDto }         from '@app/server/controllers/invitations/dto/InvitationsCreateInput.dto';
import { InvitationsCreateResponseDto }      from '@app/server/controllers/invitations/dto/InvitationsCreateResponse.dto';
import { InvitationsDeleteInputDto }         from '@app/server/controllers/invitations/dto/InvitationsDeleteInput.dto';
import { InvitationsDeleteResponseDto }      from '@app/server/controllers/invitations/dto/InvitationsDeleteResponse.dto';
import { InvitationsTransferInputDto }       from '@app/server/controllers/invitations/dto/InvitationsTransferInput.dto';
import { InvitationsTransferResponseDto }    from '@app/server/controllers/invitations/dto/InvitationsTransferResponse.dto';

export async function invitationsSearch(
    event: string,
    token: string,
    query: Partial<InvitationsSearchInputDto>,
): Promise<AxiosResponse<InvitationsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<InvitationsSearchInputDto>>(`/invitations/${event}/search`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function invitationsOwnedSearch(
    token: string,
    query: Partial<InvitationsOwnedSearchInputDto>,
): Promise<AxiosResponse<InvitationsOwnedSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<InvitationsOwnedSearchInputDto>>(`/invitations/search`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function invitationsCreate(
    event: string,
    token: string,
    query: Partial<InvitationsCreateInputDto>,
): Promise<AxiosResponse<InvitationsCreateResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<InvitationsCreateInputDto>>(`/invitations/${event}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function invitationsDelete(
    event: string,
    token: string,
    query: Partial<InvitationsDeleteInputDto>,
): Promise<AxiosResponse<InvitationsDeleteResponseDto>> {

    const self: T721SDK = this;

    return self.delete<Partial<InvitationsDeleteInputDto>>(`/invitations/${event}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function invitationsTransfer(
    invitation: string,
    token: string,
    query: Partial<InvitationsTransferInputDto>,
): Promise<AxiosResponse<InvitationsTransferResponseDto>> {

    const self: T721SDK = this;

    return self.put<Partial<InvitationsTransferInputDto>>(`/transfer/${invitation}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
