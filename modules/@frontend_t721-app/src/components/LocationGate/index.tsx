import React, { PropsWithChildren }      from 'react';
// import { useDispatch, useSelector }                 from 'react-redux';
// import { GetLocation, LocationState, T721AppState } from '../../redux';
// import { useDeepEffect }                            from '@frontend/core/lib/hooks/useDeepEffect';

export const LocationGate: React.FC = (props: PropsWithChildren<any>) => {
    // const location = useSelector((state: T721AppState): LocationState => state.location);
    // const dispatch = useDispatch();

    // useDeepEffect(() => {
    //     if (location.location === null && location.requesting === false) {
    //         dispatch(GetLocation());
    //     }
    // }, [location]);

    return props.children;

};

