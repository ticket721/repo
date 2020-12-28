import '../locales';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { SetToken, Token } from '../../redux/ducks/auth';
import { FullPageLoading } from '@frontend/flib-react/lib/components';
import { useRequest } from '../../hooks/useRequest';
import { UsersMeResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/users/dto/UsersMeResponse.dto';
import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { useDeepEffect } from '../../hooks/useDeepEffect';
import { isRequestError } from '../../utils/isRequestError';
import { AppState } from '../../redux';
import { onId } from '../../tracking/id';

export const UserContext = React.createContext<PasswordlessUserDto>(undefined);

interface LoggedInUserGuardProps {
    token: Token;
    setState: (pu: PasswordlessUserDto) => void;
    setReady: (ready: boolean) => void;
}

const LoggedInUserGuard: React.FC<PropsWithChildren<LoggedInUserGuardProps>> = (
    props: PropsWithChildren<LoggedInUserGuardProps>,
) => {
    const [uuid] = useState<string>(v4() + '@userguard');
    const dispatch = useDispatch();

    const userReq = useRequest<UsersMeResponseDto>(
        {
            method: 'users.me',
            args: [props.token.value],
            refreshRate: 10,
        },
        uuid,
    );

    useEffect(() => {
        return () => {
            props.setReady(false);
        };
    }, []);

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
        props.setState(userReq.response.data?.user || null);
        if (!userReq.response.loading) {
            props.setReady(true);
        }
    }, [userReq.response]);

    return null;
};

interface LoggedOutUserGuardProps {
    token: Token;
    setState: (pu: PasswordlessUserDto) => void;
    setReady: (ready: boolean) => void;
}

const LoggedOutUserGuard: React.FC<LoggedOutUserGuardProps> = (props: LoggedOutUserGuardProps): JSX.Element => {
    useEffect(() => {
        props.setState(null);
        props.setReady(true);
        return () => {
            props.setReady(false);
        };
    }, []);

    return null;
};

export const UserContextGuard: React.FC<{}> = (props) => {
    const token = useSelector((state: AppState) => state.auth.token);
    const [userState, setUserState] = useState<PasswordlessUserDto>(null);
    const [ready, setReady] = useState(false);

    if (token === undefined) {
        return <FullPageLoading />;
    }

    return (
        <>
            {token !== null ? (
                <LoggedInUserGuard token={token} setState={setUserState} setReady={setReady} />
            ) : (
                <LoggedOutUserGuard token={token} setState={setUserState} setReady={setReady} />
            )}
            <UserContext.Provider value={userState}>
                {!ready ? <FullPageLoading /> : props.children}
            </UserContext.Provider>
        </>
    );
};
