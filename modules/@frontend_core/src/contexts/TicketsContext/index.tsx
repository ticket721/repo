import '../locales';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AppState } from '@frontend-core/redux';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { Token } from '../../redux/ducks/auth';
import { RequestBag, useRequest } from '../../hooks/useRequest';
import { TicketsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsSearchResponse.dto';
import { isNil } from 'lodash';

export const TicketsContext = React.createContext<RequestBag<TicketsSearchResponseDto>>(undefined);

interface LoggedInTicketsGuardProps {
    token: Token;
    setResp: (rb: RequestBag<TicketsSearchResponseDto>) => void;
}

const LoggedInTicketsGuard: React.FC<PropsWithChildren<LoggedInTicketsGuardProps>> = (
    props: PropsWithChildren<LoggedInTicketsGuardProps>,
) => {
    const [uuid] = useState<string>(v4() + '@ticketsguard');

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

    useEffect(() => {
        props.setResp(ticketsReq);
    }, [ticketsReq]);

    return null;
};

interface LoggedOutTicketsGuardProps {
    token: Token;
    setResp: (rb: RequestBag<TicketsSearchResponseDto>) => void;
}

const LoggedOutTicketsGuard: React.FC<PropsWithChildren<LoggedOutTicketsGuardProps>> = (
    props: PropsWithChildren<LoggedOutTicketsGuardProps>,
) => {
    useEffect(() => {
        props.setResp({
            response: {
                data: null,
                error: null,
                loading: false,
                errors: 0,
            },
            registerEntity: () => undefined,
            unregisterEntity: () => undefined,
            force: () => undefined,
        });
    }, []);

    return null;
};

export const TicketsContextGuard: React.FC<{}> = (props) => {
    const token = useSelector((state: AppState) => state.auth.token);
    const [ticketsReq, setTicketsReq] = useState<RequestBag<TicketsSearchResponseDto>>({
        response: {
            data: null,
            error: null,
            loading: false,
            errors: 0,
        },
        registerEntity: () => undefined,
        unregisterEntity: () => undefined,
        force: () => undefined,
    });

    return (
        <>
            {isNil(token) ? (
                <LoggedOutTicketsGuard token={token} setResp={setTicketsReq}>
                    {props.children}
                </LoggedOutTicketsGuard>
            ) : (
                <LoggedInTicketsGuard token={token} setResp={setTicketsReq}>
                    {props.children}
                </LoggedInTicketsGuard>
            )}
            <TicketsContext.Provider value={ticketsReq}>{props.children}</TicketsContext.Provider>
        </>
    );
};
