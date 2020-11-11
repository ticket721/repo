import { AppState } from '@frontend-core/redux';
import { useSelector } from 'react-redux';

export const useToken = (): string => {
    return useSelector((state: AppState) => state.auth.token?.value);
};
