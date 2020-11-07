import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { AppState } from '../../redux/ducks';
import { CacheCore } from '../../cores/cache/CacheCore';
import { ManualFetchItem, RegisterEntity, UnregisterEntity } from '../../redux/ducks/cache';
import { useDeepEffect } from '../useDeepEffect';
import { useCallback, useMemo } from 'react';

interface RequestParams {
    method: string;
    args: any[];
    refreshRate: number;
    options?: Partial<LazyRequestOptions>;
}

export interface RequestResp<ReturnType> {
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
    force: () => void;
};

export const useRequest = <ReturnType>(call: RequestParams, initialUuid: string): RequestBag<ReturnType> => {
    const key = useMemo(() => CacheCore.key(call.method, call.args), [call.method, JSON.stringify(call.args)]);

    const data = useSelector((state: AppState) => state.cache.items[key]?.data, shallowEqual);

    const error = useSelector((state: AppState) => state.cache.items[key]?.error, shallowEqual);

    const loading = useSelector((state: AppState) => !state.cache.items[key]);

    const response: RequestResp<ReturnType> = useMemo(
        () => ({
            data,
            error,
            loading,
        }),
        [JSON.stringify(data), JSON.stringify(error), loading],
    );

    const dispatch = useDispatch();

    const registerEntity = useCallback(
        (uuid: string, refreshRate?: number): void =>
            void dispatch(RegisterEntity(call.method, call.args, uuid, refreshRate ? refreshRate : call.refreshRate)),
        [call.method, JSON.stringify(call.args), call.refreshRate],
    );

    const unregisterEntity = useCallback((uuid: string): void => void dispatch(UnregisterEntity(key, uuid)), [
        call.method,
        JSON.stringify(call.args),
    ]);

    const force = useCallback((): void => {
        console.log('Force Requesting', call.method);
        dispatch(ManualFetchItem(key, call.method, call.args));
    }, [call.method, JSON.stringify(call.args)]);

    useDeepEffect(() => {
        if (call.options && call.options.force) {
            dispatch(ManualFetchItem(key, call.method, call.args));
        }
        registerEntity(initialUuid);

        return () => unregisterEntity(initialUuid);
    }, [call.options, call.method, call.args]);

    return useMemo(
        () => ({
            response: {
                ...response,
                data: response.data,
            },
            registerEntity,
            unregisterEntity,
            force,
        }),
        [registerEntity, unregisterEntity, force, response],
    );
};
