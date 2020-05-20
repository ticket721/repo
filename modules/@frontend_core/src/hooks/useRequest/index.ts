import { useDispatch, useSelector }               from 'react-redux';
import { AppState }                               from '../../redux/ducks';
import { CacheCore }                              from '../../cores/cache/CacheCore';
import { useEffect }                                         from 'react';
import { RegisterComponent, UnregisterComponent } from '../../redux/ducks/cache';

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
    registerComponent: (uuid: string, refreshRates?: number) => void;
    unregisterComponent: (uuid: string) => void;
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

    const registerComponent = (uuid: string, refreshRate?: number): void =>
        void dispatch(RegisterComponent(
            CacheCore.key(call.method, call.args),
            call.method,
            call.args,
            uuid,
            refreshRate ? refreshRate : call.refreshRate
        ));

    const unregisterComponent = (uuid: string): void =>
        void dispatch(UnregisterComponent(
            CacheCore.key(call.method, call.args),
            uuid
        ));

    useEffect(() => {
        registerComponent(initialUuid);

        return () => unregisterComponent(initialUuid);
    }, []);

    return {
        response: {
            ...response,
            data: response.data ? response.data['data'] : null
        },
        registerComponent,
        unregisterComponent,
    }
};
