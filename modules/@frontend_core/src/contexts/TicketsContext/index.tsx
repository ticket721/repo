import '../locales';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AppState } from '@frontend-core/redux';
import { useSelector } from 'react-redux';
import { v4 } from 'uuid';
import { Token } from '../../redux/ducks/auth';
import { RequestBag, useRequest } from '../../hooks/useRequest';
import { TicketsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsSearchResponse.dto';
import { InvitationsOwnedSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/invitations/dto/InvitationsOwnedSearchResponse.dto';
import { isNil } from 'lodash';

export const TicketsContext = React.createContext<{
    tickets: RequestBag<TicketsSearchResponseDto>;
    invitations: RequestBag<InvitationsOwnedSearchResponseDto>;
}>(undefined);

interface LoggedInTicketsGuardProps {
    token: Token;
    setTicketsResp: (rb: RequestBag<TicketsSearchResponseDto>) => void;
    setInvitationsResp: (rb: RequestBag<InvitationsOwnedSearchResponseDto>) => void;
}

const LoggedInTicketsGuard: React.FC<PropsWithChildren<LoggedInTicketsGuardProps>> = (
    props: PropsWithChildren<LoggedInTicketsGuardProps>,
) => {
    const [uuid] = useState<string>(v4());

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
        uuid + '@ticketsguard',
    );

    const invitationsReq = useRequest<InvitationsOwnedSearchResponseDto>(
        {
            method: 'invitations.ownedSearch',
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
        uuid + '@invitationsguard',
    );

    useEffect(() => {
        props.setTicketsResp(ticketsReq);
    }, [ticketsReq]);

    useEffect(() => {
        props.setInvitationsResp(invitationsReq);
    }, [invitationsReq]);

    return null;
};

interface LoggedOutTicketsGuardProps {
    token: Token;
    setTicketsResp: (rb: RequestBag<TicketsSearchResponseDto>) => void;
    setInvitationsResp: (rb: RequestBag<InvitationsOwnedSearchResponseDto>) => void;
}

const LoggedOutTicketsGuard: React.FC<PropsWithChildren<LoggedOutTicketsGuardProps>> = (
    props: PropsWithChildren<LoggedOutTicketsGuardProps>,
) => {
    useEffect(() => {
        props.setTicketsResp({
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

        props.setInvitationsResp({
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

    const [invitationsReq, setInvitationsReq] = useState<RequestBag<InvitationsOwnedSearchResponseDto>>({
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
                <LoggedOutTicketsGuard
                    token={token}
                    setTicketsResp={setTicketsReq}
                    setInvitationsResp={setInvitationsReq}
                >
                    {props.children}
                </LoggedOutTicketsGuard>
            ) : (
                <LoggedInTicketsGuard
                    token={token}
                    setTicketsResp={setTicketsReq}
                    setInvitationsResp={setInvitationsReq}
                >
                    {props.children}
                </LoggedInTicketsGuard>
            )}
            <TicketsContext.Provider
                value={{
                    tickets: ticketsReq,
                    invitations: invitationsReq,
                }}
            >
                {props.children}
            </TicketsContext.Provider>
        </>
    );
};
