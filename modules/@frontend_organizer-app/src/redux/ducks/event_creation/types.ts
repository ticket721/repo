import {
    EventsCreateTextMetadata,
    EventsCreateImagesMetadata,
    EventsCreateModulesConfiguration,
    EventsCreateDatesConfiguration,
    EventsCreateCategoriesConfiguration,
    EventsCreateAdminsConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { EventCreationActions, EventCreationSteps } from '../../../core/event_creation/EventCreationCore';
import { ActionSetStatus }                          from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

export enum EventCreationActionTypes {
    InitEventAcset = '@@eventcreation/initeventacset',
    SetEventAcset = '@@eventcreation/seteventacset',
    ResetEventAcset = '@@eventcreation/reseteventacset',
    SetAcsetStatus = '@@eventcreation/setacsetstatus',
    SetCurrentActionIdx = '@@eventcreation/setcurrentactionidx',
    SetCurrentAction = '@@eventcreation/setcurrentaction',
    SetCompletedStep = '@@eventcreation/setcompletestep',
    SetActionData = '@@eventcreation/setactiondata',
    SetSync = '@@eventcreation/setsync',
    UpdateAction = '@@eventcreation/updateaction',
}

export interface EventCreationState {
    acsetId: string;
    acsetStatus: ActionSetStatus;
    currentActionIdx: number;
    currentAction: EventCreationActions;
    completedStep: EventCreationSteps;
    textMetadata: EventsCreateTextMetadata;
    imagesMetadata: EventsCreateImagesMetadata;
    modulesConfiguration: EventsCreateModulesConfiguration;
    datesConfiguration: EventsCreateDatesConfiguration;
    categoriesConfiguration: EventsCreateCategoriesConfiguration;
    adminsConfiguration: EventsCreateAdminsConfiguration;
    sync: boolean;
}
