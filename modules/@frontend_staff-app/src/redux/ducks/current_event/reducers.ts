import { Reducer }                                                                                   from 'redux';
import { CurrentEventState, CurrentEventTypes }                                                                                 from './types';
import {
    ISetEventId,
    ISetDate,
    CurrentEventAction,
    ISetFilteredCategories,
    IPushCategory,
    IRemoveCategory,
    ISetCheckedGuests,
    IPushGuest, IRemoveGuest,
} from './actions';

export const currentEventInitialState: CurrentEventState = {
    eventId: '',
    dateId: '',
    dateName: '',
    filteredCategories: [],
    checkedGuests: [],
};

const SetEventIdReducer: Reducer<CurrentEventState, ISetEventId> = (
    state: CurrentEventState,
    action: ISetEventId,
): CurrentEventState => {
    localStorage.setItem('currentEvent', action.eventId);
    return {
        ...state,
        eventId: action.eventId
    }
};

const SetDateReducer: Reducer<CurrentEventState, ISetDate> = (
    state: CurrentEventState,
    action: ISetDate,
): CurrentEventState => {
    localStorage.setItem('currentDateId', action.dateId);
    localStorage.setItem('currentDateName', action.dateName);

    return {
        ...state,
        dateId: action.dateId,
        dateName: action.dateName,
    }
};

const SetFilteredCategoriesReducer: Reducer<CurrentEventState, ISetFilteredCategories> = (
    state: CurrentEventState,
    action: ISetFilteredCategories,
): CurrentEventState => {
    localStorage.setItem(`date:${state.dateId}/filteredCategories`, JSON.stringify(action.categories));

    return {
        ...state,
        filteredCategories: action.categories,
    }
};

const PushCategoryReducer: Reducer<CurrentEventState, IPushCategory> = (
    state: CurrentEventState,
    action: IPushCategory,
): CurrentEventState => {
    const filteredCategories = [
        ...state.filteredCategories,
        action.category,
    ];

    localStorage.setItem(`date:${state.dateId}/filteredCategories`, JSON.stringify(filteredCategories));

    return {
        ...state,
        filteredCategories,
    }
};

const RemoveCategoryReducer: Reducer<CurrentEventState, IRemoveCategory> = (
    state: CurrentEventState,
    action: IRemoveCategory,
): CurrentEventState => {
    const filteredCategories = state.filteredCategories
        .filter(category => category.id !== action.categoryId);

    localStorage.setItem(`date:${state.dateId}/filteredCategories`, JSON.stringify(filteredCategories));

    return {
        ...state,
        filteredCategories,
    }
};

const SetChekedGuestsReducer: Reducer<CurrentEventState, ISetCheckedGuests> = (
    state: CurrentEventState,
    action: ISetCheckedGuests,
): CurrentEventState => {
    localStorage.setItem(`date:${state.dateId}/checkedGuests`, JSON.stringify(action.guests));

    return {
        ...state,
        checkedGuests: action.guests,
    }
};

const PushGuestReducer: Reducer<CurrentEventState, IPushGuest> = (
    state: CurrentEventState,
    action: IPushGuest,
): CurrentEventState => {
    const checkedGuests = [
        ...state.checkedGuests,
        action.guest,
    ];

    localStorage.setItem(`date:${state.dateId}/checkedGuests`, JSON.stringify(checkedGuests));

    return {
        ...state,
        checkedGuests,
    }
};

const RemoveGuestReducer: Reducer<CurrentEventState, IRemoveGuest> = (
    state: CurrentEventState,
    action: IRemoveGuest,
): CurrentEventState => {
    const checkedGuests = state.checkedGuests
        .filter(guest => guest.ticketId !== action.ticketId);

    localStorage.setItem(`date:${state.dateId}/checkedGuests`, JSON.stringify(checkedGuests));

    return {
        ...state,
        checkedGuests,
    }
};

export const CurrentEventReducer: Reducer<CurrentEventState, CurrentEventAction> = (
    state: CurrentEventState = currentEventInitialState,
    action: CurrentEventAction,
): CurrentEventState => {
    switch (action.type) {
        case CurrentEventTypes.SetEventId:
            return SetEventIdReducer(state, action as ISetEventId);
        case CurrentEventTypes.SetDate:
            return SetDateReducer(state, action as ISetDate);
        case CurrentEventTypes.SetFilteredCategories:
            return SetFilteredCategoriesReducer(state, action as ISetFilteredCategories);
        case CurrentEventTypes.PushCategory:
            return PushCategoryReducer(state, action as IPushCategory);
        case CurrentEventTypes.RemoveCategory:
            return RemoveCategoryReducer(state, action as IRemoveCategory);
        case CurrentEventTypes.SetCheckedGuests:
            return SetChekedGuestsReducer(state, action as ISetCheckedGuests);
        case CurrentEventTypes.PushGuest:
            return PushGuestReducer(state, action as IPushGuest);
        case CurrentEventTypes.RemoveGuest:
            return RemoveGuestReducer(state, action as IRemoveGuest);
        default:
            return state;
    }
};
