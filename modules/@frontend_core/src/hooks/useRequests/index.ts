import { useDispatch, useSelector }               from 'react-redux';
import { AppState }                               from '../../redux/ducks';
import { CacheCore }                              from '../../cores/cache/CacheCore';
import { useEffect }                                         from 'react';
import { RegisterComponent, UnregisterComponent } from '../../redux/ducks/cache';

export interface RequestTemplate {
    [key: string]: (...args: any[]) => any;
}

interface RequestParams<InputType> {
    method: string;
    args: InputType;
    refreshRate: number;
}

type RequestsCalls<TemplateInterfaceType extends RequestTemplate> = {
    readonly [P in keyof TemplateInterfaceType]: RequestParams<Parameters<TemplateInterfaceType[P]>>
}

interface RequestResp<DataType> {
    data: DataType;
    error: any;
    loading: boolean;
}

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type Responses<TemplateInterfaceType extends RequestTemplate> = {
    [P in keyof TemplateInterfaceType]: RequestResp<ThenArg<ReturnType<TemplateInterfaceType[P]>>>
};

export type RequestsBag<TemplateInterfaceType extends RequestTemplate> = {
    responses: Responses<TemplateInterfaceType>;
    registerComponent: (uuid: string, refreshRates?: {[P in keyof TemplateInterfaceType]: number}) => void;
    unregisterComponent: (uuid: string) => void;
}

export const useRequests = <TemplateInterfaceType extends RequestTemplate>(
    calls: RequestsCalls<TemplateInterfaceType>,
    initialUuid: string
): RequestsBag<TemplateInterfaceType> => {
    useEffect(() => {
        for (const [entityKey, entity] of entities) {
            responses[entityKey] = {
                ...useSelector((state: AppState) => state.cache.items[CacheCore.key(entity.method, entity.args)]),
                loading: !useSelector((state: AppState) => state.cache.items[CacheCore.key(entity.method, entity.args)]
                )
            };

            if (!responses[entityKey].error) {
                responses[entityKey]['config'] = responses[entityKey].data?.config;
                responses[entityKey].data = responses[entityKey].data?.data;
            }
        }
    });

    const entities: Array<[keyof TemplateInterfaceType, RequestParams<any>]> = Object.entries(calls);

    const dispatch = useDispatch();

    const responses: Responses<TemplateInterfaceType> = {} as Responses<TemplateInterfaceType>;

    const registerComponent = (uuid: string, refreshRates?: {[P in keyof TemplateInterfaceType]: number}) => entities.forEach(
        ([key, entity]) => void dispatch(RegisterComponent(
            CacheCore.key(entity.method, entity.args),
            entity.method,
            entity.args,
            uuid,
            refreshRates ? refreshRates[key] : entity.refreshRate
        ))
    );

    const unregisterComponent = (uuid: string) => entities.forEach(
        ([, entity]) => void dispatch(UnregisterComponent(
            CacheCore.key(entity.method, entity.args),
            uuid
        ))
    );

    useEffect(() => {
        registerComponent(initialUuid);

        return () => unregisterComponent(initialUuid);
    }, []);

    return {
        responses,
        registerComponent,
        unregisterComponent,
    }
};
