import { AppState } from '@frontend-core/redux';
import { useSelector } from 'react-redux';

export const useToken = (): string => {
    const token = useSelector((state: AppState) => state.auth.token.value);

    return token;
};
