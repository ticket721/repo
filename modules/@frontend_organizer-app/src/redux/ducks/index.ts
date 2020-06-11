import { EventCreationState, EventCreationReducer, eventCreationInitialState, eventCreationSaga } from './event_creation';


export interface OrganizerState {
    eventCreation: EventCreationState;
}

export const organizerReducer = {
    eventCreation: EventCreationReducer,
};

export const organizerInitialState = {
    eventCreation: eventCreationInitialState,
};

export const organizerSagas = [
    eventCreationSaga
];
