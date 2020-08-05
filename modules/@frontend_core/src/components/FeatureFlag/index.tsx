import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux';

export interface FeatureFlagProps {
    flag: string;
}

export const FeatureFlag: React.FC<PropsWithChildren<FeatureFlagProps>> = (
    props: PropsWithChildren<FeatureFlagProps>,
): JSX.Element => {
    const flagData = useSelector((state: AppState) => state.featureflags[props.flag]);

    if (!flagData || !flagData.active) {
        return null;
    } else {
        return <>{props.children}</>;
    }
};
