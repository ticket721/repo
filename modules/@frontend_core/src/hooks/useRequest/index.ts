import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { AppState } from '../../redux/ducks';
import { CacheCore } from '../../cores/cache/CacheCore';
import { ManualFetchItem, RegisterEntity, UnregisterEntity } from '../../redux/ducks/cache';
import { useDeepEffect } from '../useDeepEffect';

interface RequestParams {
    method: string;
    args: any[];
    refreshRate: number;
    options?: Partial<LazyRequestOptions>;
}

interface RequestResp<ReturnType> {
    data: ReturnType;
    error: any;
    loading: boolean;
}

export interface LazyRequestOptions {
    force: boolean;
}

export type RequestBag<ReturnType> = {
    response: RequestResp<ReturnType>;
    registerEntity: (uuid: string, refreshRates?: number) => void;
    unregisterEntity: (uuid: string) => void;
};

export const useRequest = <ReturnType>(call: RequestParams, initialUuid: string): RequestBag<ReturnType> => {
    const response: RequestResp<ReturnType> = {
        data: useSelector(
            (state: AppState) => state.cache.items[CacheCore.key(call.method, call.args)]?.data,
            shallowEqual,
        ),
        error: useSelector(
            (state: AppState) => state.cache.items[CacheCore.key(call.method, call.args)]?.error,
            shallowEqual,
        ),
        loading: !useSelector(
            (state: AppState) => state.cache.items[CacheCore.key(call.method, call.args)],
            shallowEqual,
        ),
    };

    const dispatch = useDispatch();

    const registerEntity = (uuid: string, refreshRate?: number): void =>
        void dispatch(RegisterEntity(call.method, call.args, uuid, refreshRate ? refreshRate : call.refreshRate));

    const unregisterEntity = (uuid: string): void =>
        void dispatch(UnregisterEntity(CacheCore.key(call.method, call.args), uuid));

    useDeepEffect(() => {
        if (call.options && call.options.force) {
            dispatch(ManualFetchItem(CacheCore.key(call.method, call.args), call.method, call.args));
        }
        registerEntity(initialUuid);

        return () => unregisterEntity(initialUuid);
    }, [call]);

    return {
        response: {
            ...response,
            data: response.data,
        },
        registerEntity,
        unregisterEntity,
    };
};
