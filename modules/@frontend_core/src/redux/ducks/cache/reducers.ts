import { Reducer }                                                                                 from 'redux';
import { CacheActionTypes, CacheState }                                                            from './types';
import { ISetIntervalId, ISetTickInterval }                                                from './actions/settings.actions';
import {
    CacheAction,
    IUpdateItemData,
    IUpdateItemError,
    IFetchItem,
} from './actions/actions';
import {
    IUpdateLastResponse,
    IRegisterComponent,
    IUnregisterComponent,
} from './actions/properties.actions';
import { CacheCore }                                 from '../../../cores/cache/CacheCore';

export const cacheInitialState: CacheState = {
    settings: {
        startTimestamp: Date.now(),
        intervalId: null,
        tickInterval: 1000,
    },
    items: {},
    properties: {},
};

const SetTickIntervalReducer: Reducer<CacheState, ISetTickInterval> = (
    state: CacheState,
    action: ISetTickInterval,
): CacheState => ({
    ...state,
    settings: {
        ...state.settings,
        tickInterval: action.tickInterval,
    },
});

const SetIntervalIdReducer: Reducer<CacheState, ISetIntervalId> = (
    state: CacheState,
    action: ISetIntervalId,
): CacheState => ({
    ...state,
    settings: {
        ...state.settings,
        intervalId: action.intervalId,
    },
});

const RegisterComponentReducer: Reducer<CacheState, IRegisterComponent> = (
    state: CacheState,
    action: IRegisterComponent,
): CacheState => {
    if (!state.properties[action.key]) {
        return {
            ...state,
            properties: {
                ...state.properties,
                [action.key]: {
                    lastFetch: null,
                    lastResp: null,
                    method: action.method,
                    args: action.args,
                    requestedBy: [action.uid],
                    refreshRates: [action.rate],
                },
            },
        };
    }

    return {
        ...state,
        properties: {
            ...state.properties,
            [action.key]: {
                ...state.properties[action.key],
                requestedBy: state.properties[action.key].requestedBy.concat(action.uid),
                refreshRates: state.properties[action.key].refreshRates.concat(action.rate),
            },
        },
    };
};

const UnregisterComponentReducer: Reducer<CacheState, IUnregisterComponent> = (
    state: CacheState,
    action: IUnregisterComponent,
): CacheState => {
    const removeIdx: number = state.properties[action.key].requestedBy.indexOf(action.uid);

    return {
        ...state,
        properties: {
            ...state.properties,
            [action.key]: {
                ...state.properties[action.key],
                requestedBy: state.properties[action.key].requestedBy.filter((val, idx) => idx !== removeIdx),
                refreshRates: state.properties[action.key].refreshRates.filter((val, idx) => idx !== removeIdx),
            },
        },
    };
};

const FetchItemReducer: Reducer<CacheState, IFetchItem> = (state: CacheState, action: IFetchItem): CacheState => ({
    ...state,
    properties: {
        ...state.properties,
        [action.key]: {
            ...state.properties[action.key],
            lastFetch: CacheCore.elapsedTicks(state.settings),
        },
    },
});

const UpdateLastResponseReducer: Reducer<CacheState, IUpdateLastResponse> = (
    state: CacheState,
    action: IUpdateLastResponse,
): CacheState => ({
    ...state,
    properties: {
        ...state.properties,
        [action.key]: {
            ...state.properties[action.key],
            lastResp: CacheCore.elapsedTicks(state.settings),
        },
    },
});

const UpdateItemDataReducer: Reducer<CacheState, IUpdateItemData> = (
    state: CacheState,
    action: IUpdateItemData,
): CacheState => ({
    ...state,
    items: {
        ...state.items,
        [action.key]: {
            ...state.items[action.key],
            data: action.data,
        },
    },
});

const UpdateItemErrorReducer: Reducer<CacheState, IUpdateItemError> = (
    state: CacheState,
    action: IUpdateItemError,
): CacheState => ({
    ...state,
    items: {
        ...state.items,
        [action.key]: {
            ...state.items[action.key],
            error: action.error,
        },
    },
});

export const CacheReducer: Reducer<CacheState, CacheAction> = (
    state: CacheState = cacheInitialState,
    action: CacheAction,
): CacheState => {
    switch (action.type) {
        case CacheActionTypes.SetTickInterval:
            return SetTickIntervalReducer(state, action as ISetTickInterval);
        case CacheActionTypes.SetIntervalId:
            return SetIntervalIdReducer(state, action as ISetIntervalId);
        case CacheActionTypes.RegisterComponent:
            return RegisterComponentReducer(state, action as IRegisterComponent);
        case CacheActionTypes.UnregisterComponent:
            return UnregisterComponentReducer(state, action as IUnregisterComponent);
        case CacheActionTypes.FetchItem:
            return FetchItemReducer(state, action as IFetchItem);
        case CacheActionTypes.UpdateLastResponse:
            return UpdateLastResponseReducer(state, action as IUpdateLastResponse);
        case CacheActionTypes.UpdateItemData:
            return UpdateItemDataReducer(state, action as IUpdateItemData);
        case CacheActionTypes.UpdateItemError:
            return UpdateItemErrorReducer(state, action as IUpdateItemError);
        default:
            return state;
    }
};
