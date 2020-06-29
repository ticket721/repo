import {
    EventsCreateTextMetadata,
    EventsCreateImagesMetadata,
    EventsCreateModulesConfiguration,
    EventsCreateDatesConfiguration,
    EventsCreateCategoriesConfiguration,
    EventsCreateAdminsConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { EventCreationActions } from '../../../core/event_creation/EventCreationCore';
import { ActionSetStatus, ActionStatus }            from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

export enum EventCreationActionTypes {
    InitEventAcset = '@@eventcreation/initeventacset',
    SetEventAcset = '@@eventcreation/seteventacset',
    SetAcsetStatus = '@@eventcreation/setacsetstatus',
    SetActionsStatuses = '@@eventcreation/actionsstatuses',
    SetCurrentActionIdx = '@@eventcreation/setcurrentactionidx',
    SetCurrentAction = '@@eventcreation/setcurrentaction',
    SetActionData = '@@eventcreation/setactiondata',
    SetSync = '@@eventcreation/setsync',
    UpdateAction = '@@eventcreation/updateaction',
}

export interface EventCreationState {
    acsetId: string;
    acsetStatus: ActionSetStatus;
    actionsStatuses: Array<ActionStatus>;
    currentActionIdx: number;
    currentAction: EventCreationActions;

    textMetadata: EventsCreateTextMetadata;
    imagesMetadata: EventsCreateImagesMetadata;
    modulesConfiguration: EventsCreateModulesConfiguration;
    datesConfiguration: EventsCreateDatesConfiguration;
    categoriesConfiguration: EventsCreateCategoriesConfiguration;
    adminsConfiguration: EventsCreateAdminsConfiguration;
    sync: boolean;
}
