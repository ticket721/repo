import {
    EventsCreateAdminsConfiguration,
    EventsCreateCategoriesConfiguration,
    EventsCreateDatesConfiguration,
    EventsCreateImagesMetadata,
    EventsCreateModulesConfiguration,
    EventsCreateTextMetadata,
} from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';

// export enum AcsetKind {
//     CreateEventActions
// }
//
// export interface CreateEventActions {
//     acsetKind: AcsetKind.CreateEventActions;
//     actions: [
//         EventsCreateTextMetadata,
//         EventsCreateModulesConfiguration,
//         EventsCreateDatesConfiguration,
//         EventsCreateCategoriesConfiguration,
//         EventsCreateImagesMetadata,
//         EventsCreateAdminsConfiguration,
//     ]
// }

export type CreateEventAction =
    EventsCreateTextMetadata
    | EventsCreateModulesConfiguration
    | EventsCreateDatesConfiguration
    | EventsCreateCategoriesConfiguration
    | EventsCreateImagesMetadata
    | EventsCreateAdminsConfiguration;

export type ActionInputType = CreateEventAction;
