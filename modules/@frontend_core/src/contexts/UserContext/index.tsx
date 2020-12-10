import '../locales';
import React, { PropsWithChildren, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { SetToken, Token } from '../../redux/ducks/auth';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useRequest } from '../../hooks/useRequest';
import { UsersMeResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/users/dto/UsersMeResponse.dto';
import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { useDeepEffect } from '../../hooks/useDeepEffect';
import { useTranslation } from 'react-i18next';
import { isRequestError } from '../../utils/isRequestError';
import { AppState } from '../../redux';
import { onId } from '../../tracking/id';

export const UserContext = React.createContext<PasswordlessUserDto>(undefined);

interface LoggedInUserGuardProps {
    token: Token;
}

const LoggedInUserGuard: React.FC<PropsWithChildren<LoggedOutUserGuardProps>> = (
    props: PropsWithChildren<LoggedInUserGuardProps>,
) => {
    const [uuid] = useState<string>(v4() + '@userguard');
    const dispatch = useDispatch();
    const [t] = useTranslation('utils');

    const userReq = useRequest<UsersMeResponseDto>(
        {
            method: 'users.me',
            args: [props.token.value],
            refreshRate: 10,
        },
        uuid,
    );

    useDeepEffect(() => {
        if (isRequestError(userReq)) {
            if (userReq.response.error.response) {
                switch (userReq.response.error.response.status) {
                    case 401: {
                        dispatch(SetToken(null));
                    }
                }
            }
        }
    }, [userReq.response.error]);

    useDeepEffect(() => {
        if (userReq.response.data?.user?.valid) {
            onId(userReq.response.data.user.id, userReq.response.data.user.email);
        }
    }, [userReq.response.data?.user]);

    if (userReq.response.loading) {
        return <FullPageLoading />;
    }

    if (isRequestError(userReq)) {
        if (userReq.response.error.response) {
            switch (userReq.response.error.response.status) {
                case 401: {
                    return <Error message={'unauthorized'} retryLabel={'retry'} onRefresh={userReq.force} />;
                }
            }
        }
        return <Error message={t('cannot_reach_server')} retryLabel={t('retrying_in')} onRefresh={userReq.force} />;
    }

    return <UserContext.Provider value={userReq.response.data.user}>{props.children}</UserContext.Provider>;
};

interface LoggedOutUserGuardProps {
    token: Token;
}

const LoggedOutUserGuard: React.FC<PropsWithChildren<LoggedOutUserGuardProps>> = (
    props: PropsWithChildren<LoggedOutUserGuardProps>,
) => {
    return <UserContext.Provider value={null}>{props.children}</UserContext.Provider>;
};

export const UserContextGuard: React.FC<{}> = (props) => {
    const token = useSelector((state: AppState) => state.auth.token);

    if (token === undefined) {
        return <FullPageLoading />;
    }

    if (token === null) {
        return <LoggedOutUserGuard token={token}>{props.children}</LoggedOutUserGuard>;
    }

    return <LoggedInUserGuard token={token}>{props.children}</LoggedInUserGuard>;
};
