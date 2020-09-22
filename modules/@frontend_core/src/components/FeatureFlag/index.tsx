import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux';

export interface FeatureFlagProps {
    flag: string;
}

export const FeatureFlag: React.FC<PropsWithChildren<FeatureFlagProps>> = (
    props: PropsWithChildren<FeatureFlagProps>,
): JSX.Element => {
    const flagValue = useFeatureFlag(props.flag);

    if (!flagValue) {
        return null;
    } else {
        return <>{props.children}</>;
    }
};

export const useFeatureFlag = (flag: string): boolean => {
    const flagData = useSelector((state: AppState) => state.featureflags[flag]);

    return flagData && flagData.active;
};
