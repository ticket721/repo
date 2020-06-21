import { Action }                                               from 'redux';
import { SearchActionTypes } from './types';

export interface ISetSearch extends Action<string> {
    type: SearchActionTypes.SetSearch;
    query: string;
}

export const SetSearch = (query: string): ISetSearch => ({
    type: SearchActionTypes.SetSearch,
    query,
});

export type SearchAction = ISetSearch;
