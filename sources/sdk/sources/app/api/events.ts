import { AxiosResponse }            from 'axios';
import { T721SDK }                  from '../../index';
import { EventsSearchInputDto }     from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto }  from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventsCreateInputDto }     from '@app/server/controllers/events/dto/EventsCreateInput.dto';
import { EventsCreateResponseDto }  from '@app/server/controllers/events/dto/EventsCreateResponse.dto';
import {
    EventsCreateAdminsConfiguration,
    EventsCreateCategoriesConfiguration,
    EventsCreateDatesConfiguration, EventsCreateImagesMetadata,
    EventsCreateModulesConfiguration,
    EventsCreateTextMetadata,
}                                                 from '@app/server/controllers/events/actionhandlers/Events.input.handlers';
import { ActionsUpdateResponseDto }               from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { actionsUpdate}                           from './actions';
import { EventsBuildResponseDto }                 from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto }                    from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import { EventsDeployInputDto }                   from '@app/server/controllers/events/dto/EventsDeployInput.dto';
import { EventsDeployResponseDto }                from '@app/server/controllers/events/dto/EventsDeployResponse.dto';
import { EventsDeployGeneratePayloadResponseDto } from '@app/server/controllers/events/dto/EventsDeployGeneratePayloadResponse.dto';

export async function eventsSearch(
    token: string,
    query: EventsSearchInputDto,
): Promise<AxiosResponse<EventsSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsSearchInputDto>('/events/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsCreate(
    token: string,
    query: EventsCreateInputDto,
): Promise<AxiosResponse<EventsCreateResponseDto>> {
    const self: T721SDK = this;

    return self.post<EventsCreateInputDto>('/events', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsBuild(
    token: string,
    query: EventsBuildInputDto,
): Promise<AxiosResponse<EventsBuildResponseDto>> {
    const self: T721SDK = this;

    return self.post<EventsBuildInputDto>('/events/build', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function eventsCreateTextMetadata(
    token: string,
    actionset: string,
    query: EventsCreateTextMetadata,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        {
            actionset_id: actionset,
            data: query,
            update_idx: 0,
        },
    );
}

export async function eventsCreateModulesConfiguration(
    token: string,
    actionset: string,
    query: EventsCreateModulesConfiguration,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        {
            actionset_id: actionset,
            data: query,
            update_idx: 1,
        },
    );
}

export async function eventsCreateDatesConfiguration(
    token: string,
    actionset: string,
    query: EventsCreateDatesConfiguration,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        {
            actionset_id: actionset,
            data: query,
            update_idx: 2,
        },
    );
}

export async function eventsCreateCategoriesConfiguration(
    token: string,
    actionset: string,
    query: EventsCreateCategoriesConfiguration,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        {
            actionset_id: actionset,
            data: query,
            update_idx: 3,
        },
    );
}

export async function eventsCreateImagesMetadata(
    token: string,
    actionset: string,
    query: EventsCreateImagesMetadata,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        {
            actionset_id: actionset,
            data: query,
            update_idx: 4,
        },
    );
}

export async function eventsCreateAdminsConfiguration(
    token: string,
    actionset: string,
    query: EventsCreateAdminsConfiguration,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        {
            actionset_id: actionset,
            data: query,
            update_idx: 5,
        },
    );
}

export async function eventsDeployGeneratePayload(
    token: string,
    event: string,
): Promise<AxiosResponse<EventsDeployGeneratePayloadResponseDto>> {

    const self: T721SDK = this;

    return self.get(`/events/genp/deploy/${event}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
}

export async function eventsDeploy(
    token: string,
    query: EventsDeployInputDto,
): Promise<AxiosResponse<EventsDeployResponseDto>> {

    const self: T721SDK = this;

    return self.post<EventsDeployInputDto>(`/events/deploy`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
