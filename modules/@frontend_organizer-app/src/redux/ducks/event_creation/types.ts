import {
    EventsCreateTextMetadata,
    EventsCreateImagesMetadata,
    EventsCreateModulesConfiguration,
    EventsCreateDatesConfiguration,
    EventsCreateCategoriesConfiguration,
    EventsCreateAdminsConfiguration,
}                                                   from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { EventCreationActions, EventCreationSteps } from '../../../core/event_creation/EventCreationCore';

export enum EventCreationActionTypes {
    InitEventAcset = '@@eventcreation/initeventacset',
    SetEventAcset = '@@eventcreation/seteventacset',
    ResetEventAcset = '@@eventcreation/reseteventacset',
    SetCurrentAction = '@@eventcreation/setcurrentaction',
    SetCompletedStep = '@@eventcreation/setcompletestep',
    SetActionData = '@@eventcreation/setactiondata',
    SetSync = '@@eventcreation/setsync',
    UpdateAction = '@@eventcreation/updateaction',
}

export interface EventCreationState {
    acsetId: string;
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
