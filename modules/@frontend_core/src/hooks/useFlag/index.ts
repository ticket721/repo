import { useSelector } from 'react-redux';
import { AppState } from '@frontend-core/redux';

export const useFlag = (flag: string): boolean => {
    const flagData = useSelector((state: AppState) => state.featureflags[flag]);

    return flagData && flagData.active;
};
