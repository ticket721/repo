import React, { useEffect }             from 'react';
import { useDispatch, useSelector }               from 'react-redux';
import { RegisterComponent, UnregisterComponent } from '../../redux/ducks/cache';
import { CacheCore }                              from '../../cores/CacheCore';
import { AppState }                     from '../../redux/ducks';
import { v4 as uuid } from 'uuid';

export interface RequestTemplate {
    [key: string]: (...args: any[]) => any;
}

interface WithRequestsInjectedProp<DataType> {
    data: DataType;
    error: any;
    loading: boolean;
}

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type Responses<TemplateInterfaceType extends RequestTemplate> = {
    [P in keyof TemplateInterfaceType]: WithRequestsInjectedProp<ThenArg<ReturnType<TemplateInterfaceType[P]>>>
};

export type WithRequestsInjectedProps<TemplateInterfaceType extends RequestTemplate> = {
    responses: {
        readonly [P in keyof TemplateInterfaceType]: WithRequestsInjectedProp<ThenArg<ReturnType<TemplateInterfaceType[P]>>>
    }
}

interface WithRequestsInputProp<InputType> {
    method: string;
    args: InputType;
    refreshRate: number;
}

type WithRequestsInputPropsCallsField<TemplateInterfaceType extends RequestTemplate> = {
    readonly [P in keyof TemplateInterfaceType]: WithRequestsInputProp<Parameters<TemplateInterfaceType[P]>>
}

export type WithRequestsInputProps<TemplateInterfaceType extends RequestTemplate> = {
    calls: WithRequestsInputPropsCallsField<TemplateInterfaceType>;
}

export const withRequests = <TemplateInterfaceType extends RequestTemplate, RestProps = any>(
    WrappedComponent: React.FC<WithRequestsInjectedProps<TemplateInterfaceType> & RestProps>
): React.FC<WithRequestsInputProps<TemplateInterfaceType> & RestProps> => {

    const WrapperComponent: React.FC<
        WithRequestsInputProps<TemplateInterfaceType>
        & RestProps> =
            function f({
                calls,
                responses,
                ...restProps
            }: WithRequestsInputProps<TemplateInterfaceType>
                & WithRequestsInjectedProps<TemplateInterfaceType>
                & RestProps
    ): React.ReactElement<WithRequestsInjectedProps<TemplateInterfaceType> & RestProps> {
        let methodTags: string = '';
        Object.values(calls).forEach((entity) => methodTags = methodTags.concat(`(${entity.method})`));
        f['displayName'] = `WithRequests${methodTags}(${WrappedComponent.name})`;

        const entities: Array<[keyof TemplateInterfaceType, WithRequestsInputProp<any>]> = Object.entries(calls);

        f['uuid'] = `WithRequests(${WrappedComponent.name})@${uuid()}`;

        const dispatch = useDispatch();

        const getResponses = () => {
            const resps: Responses<TemplateInterfaceType> = {} as Responses<TemplateInterfaceType>;

            for (const [entityKey, entity] of entities) {
                resps[entityKey] = {
                    ...useSelector((state: AppState) => state.cache.items[CacheCore.key(entity.method, entity.args)]),
                    loading: !useSelector((state: AppState) => state.cache.items[CacheCore.key(entity.method, entity.args)]
                    )
                }
            }

            return resps;
        };

        const registerComponent = () => entities.forEach(
            ([, entity]) => void dispatch(RegisterComponent(
                CacheCore.key(entity.method, entity.args),
                entity.method,
                entity.args,
                f['uuid'],
                entity.refreshRate
            ))
        );

        const unregisterComponent = () => entities.forEach(
            ([, entity]) => void dispatch(UnregisterComponent(
                CacheCore.key(entity.method, entity.args),
                f['uuid']
            ))
        );

        useEffect(() => {
            registerComponent();

            return () => unregisterComponent();
        }, []);

        return (
            <WrappedComponent responses={getResponses()} {...restProps as any as RestProps} />
        );
    };

    return WrapperComponent;
};





