import './locales';
import React, { PropsWithChildren, useState } from 'react';
import { AppState } from '@frontend-core/redux';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { Token } from '../redux/ducks/auth';
import { FullPageLoading } from '@frontend/flib-react/lib/components';
import { RequestBag, useRequest } from '../hooks/useRequest';
import { TicketsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsSearchResponse.dto';

export const TicketsContext = React.createContext<RequestBag<TicketsSearchResponseDto>>(undefined);

interface LoggedInTicketsGuardProps {
    token: Token;
}

const LoggedInTicketsGuard: React.FC<PropsWithChildren<LoggedInTicketsGuardProps>> = (
    props: PropsWithChildren<LoggedInTicketsGuardProps>,
) => {
    const [uuid] = useState<string>(v4() + '@userguard');

    const ticketsReq = useRequest<TicketsSearchResponseDto>(
        {
            method: 'tickets.search',
            args: [
                props.token.value,
                {
                    $sort: [
                        {
                            $field_name: 'updated_at',
                            $order: 'desc',
                        },
                    ],
                },
            ],
            refreshRate: 60,
        },
        uuid,
    );

    return <TicketsContext.Provider value={ticketsReq}>{props.children}</TicketsContext.Provider>;
};

interface LoggedOutTicketsGuardProps {
    token: Token;
}

const LoggedOutTicketsGuard: React.FC<PropsWithChildren<LoggedOutTicketsGuardProps>> = (
    props: PropsWithChildren<LoggedOutTicketsGuardProps>,
) => {
    return (
        <TicketsContext.Provider
            value={{
                response: {
                    data: null,
                    error: null,
                    loading: false,
                    errors: 0,
                },
                registerEntity: () => undefined,
                unregisterEntity: () => undefined,
                force: () => undefined,
            }}
        >
            {props.children}
        </TicketsContext.Provider>
    );
};

export const TicketsContextGuard: React.FC<{}> = (props) => {
    const token = useSelector((state: AppState) => state.auth.token);

    if (token === undefined) {
        return <FullPageLoading />;
    }

    if (token === null) {
        return <LoggedOutTicketsGuard token={token}>{props.children}</LoggedOutTicketsGuard>;
    }

    return <LoggedInTicketsGuard token={token}>{props.children}</LoggedInTicketsGuard>;
};
