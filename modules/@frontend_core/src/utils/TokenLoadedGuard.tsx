import React from 'react';
import { useSelector } from 'react-redux';
import { FullPageLoading } from '@frontend/flib-react/lib/components';
import { AppState } from '../redux/index';

export const TokenLoadedGuard: React.FC<{}> = (props): JSX.Element => {
    const [token, user] = useSelector((state: AppState) => [state.auth.token, state.auth.user]);

    if (token === undefined || (token && !user)) {
        return <FullPageLoading />;
    }

    return <>{props.children}</>;
};
