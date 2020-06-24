import { Reducer }                                  from 'redux';
import { SearchActionTypes, SearchState }           from './types';
import { ISetSearch, SearchAction } from './actions';

export const searchInitialState: SearchState = {
    query: '',
};

const SetSearchReducer: Reducer<SearchState, ISetSearch> = (
    state: SearchState,
    action: ISetSearch,
): SearchState => ({
    ...state,
    query: action.query,
});

export const SearchReducer: Reducer<SearchState, SearchAction> = (
    state: SearchState = searchInitialState,
    action: SearchAction,
): SearchState => {
    switch (action.type) {
        case SearchActionTypes.SetSearch:
            return SetSearchReducer(state, action as ISetSearch);
        default:
            return state;
    }
};
