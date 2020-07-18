import { Reducer }                                                                                   from 'redux';
import { CurrentEventState, CurrentEventTypes }                                                              from './types';
import { ISetEventId, ISetDate, CurrentEventAction, ISetFilteredCategories, IPushCategory, IRemoveCategory } from './actions';

export const currentEventInitialState: CurrentEventState = {
    eventId: '',
    dateId: '',
    dateName: '',
    filteredCategories: [],
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
        default:
            return state;
    }
};
