import { Dispatch, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/ducks';
import { CacheCore } from '../../cores/cache/CacheCore';
import { ManualFetchItem, RegisterEntity, UnregisterEntity } from '../../redux/ducks/cache';
import { useDeepEffect } from '../useDeepEffect';

interface RequestResp<ReturnType> {
    data: ReturnType;
    error: any;
    loading: boolean;
    called: boolean;
}

export interface LazyRequestOptions {
    force: boolean;
}

export type RequestBag<ReturnType> = {
    response: RequestResp<ReturnType>;
    lazyRequest: (lazyArgs: any, options?: Partial<LazyRequestOptions>) => void;
};

export const useLazyRequest = <ReturnType>(method: string, initialUuid: string): RequestBag<ReturnType> => {
    const [called, setCalled] = useState(false);
    const [args, setArgs]: [any, Dispatch<any>] = useState(null);
    const response: RequestResp<ReturnType> = {
        data: useSelector((state: AppState) =>
            args ? state.cache.items[CacheCore.key(method, args)]?.data : undefined,
        ),
        error: useSelector((state: AppState) =>
            args ? state.cache.items[CacheCore.key(method, args)]?.error : undefined,
        ),
        loading: !useSelector((state: AppState) =>
            !called ? true : args ? state.cache.items[CacheCore.key(method, args)] : false,
        ),
        called,
    };

    const dispatch = useDispatch();
    const lazyRequest = (lazyArgs: any, options?: Partial<LazyRequestOptions>): void => {
        if (options?.force) {
            dispatch(ManualFetchItem(CacheCore.key(method, lazyArgs), method, lazyArgs));
        }
        dispatch(RegisterEntity(method, lazyArgs, initialUuid, 0));
        setArgs(lazyArgs);
        setCalled(true);
    };

    useDeepEffect(() => {
        return (): void => {
            if (args) {
                dispatch(UnregisterEntity(CacheCore.key(method, args), initialUuid));
            }
        };
    }, [args, initialUuid]);

    return {
        response,
        lazyRequest,
    };
};
