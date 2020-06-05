import { useDispatch, useSelector }               from 'react-redux';
import { AppState }                               from '../../redux/ducks';
import { CacheCore }                              from '../../cores/cache/CacheCore';
import { useEffect }                                         from 'react';
import { RegisterEntity, UnregisterEntity } from '../../redux/ducks/cache';

interface RequestParams {
    method: string;
    args: any[];
    refreshRate: number;
}

interface RequestResp<ReturnType> {
    data: ReturnType;
    error: any;
    loading: boolean;
}

export type RequestBag<ReturnType> = {
    response: RequestResp<ReturnType>;
    registerEntity: (uuid: string, refreshRates?: number) => void;
    unregisterEntity: (uuid: string) => void;
}

export const useRequest = <ReturnType>(
    call: RequestParams,
    initialUuid: string
): RequestBag<ReturnType> => {
    const response: RequestResp<ReturnType> = {
        ...useSelector((state: AppState) => state.cache.items[CacheCore.key(call.method, call.args)]),
        loading: !useSelector((state: AppState) => state.cache.items[CacheCore.key(call.method, call.args)]),
    };

    const dispatch = useDispatch();

    const registerEntity = (uuid: string, refreshRate?: number): void =>
        void dispatch(RegisterEntity(
            call.method,
            call.args,
            uuid,
            refreshRate ? refreshRate : call.refreshRate
        ));

    const unregisterEntity = (uuid: string): void =>
        void dispatch(UnregisterEntity(
            CacheCore.key(call.method, call.args),
            uuid
        ));

    useEffect(() => {
        registerEntity(initialUuid);

        return () => unregisterEntity(initialUuid);
    }, []);

    return {
        response: {
            ...response,
            data: response.data ? response.data['data'] : null
        },
        registerEntity,
        unregisterEntity,
    }
};
