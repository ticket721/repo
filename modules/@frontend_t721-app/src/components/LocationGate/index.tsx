import { useDispatch, useSelector }            from 'react-redux';
import React, { PropsWithChildren, useEffect }      from 'react';
import { GetLocation, LocationState, T721AppState } from '../../redux';

export const LocationGate: React.FC = (props: PropsWithChildren<any>) => {
    const location = useSelector((state: T721AppState): LocationState => state.location);
    const dispatch = useDispatch();

    useEffect(() => {
        if (location.location === null && location.requesting === false) {
            dispatch(GetLocation());
        }
    });

    return props.children;

};

