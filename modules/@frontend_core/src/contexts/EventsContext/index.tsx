import '../locales';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { v4 } from 'uuid';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { RequestBag, useRequest } from '../../hooks/useRequest';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';

import { useTranslation } from 'react-i18next';
import { isRequestError } from '../../utils/isRequestError';
import { UserContext } from '../UserContext';
import { useSelector } from 'react-redux';
import { AppState } from '@frontend-core/redux';
import { Token } from '@frontend-core/redux/ducks/auth/types';

export const EventsContext = React.createContext<RequestBag<EventsSearchResponseDto>>(undefined);

interface LoggedInEventsGuardProps {
    token: Token;
}

const LoggedInEventsGuard: React.FC<PropsWithChildren<LoggedInEventsGuardProps>> = (
    props: PropsWithChildren<LoggedInEventsGuardProps>,
) => {
    const user = useContext(UserContext);
    const [uuid] = useState<string>(v4() + '@eventsguard');

    const [t] = useTranslation('utils');
    const eventsReq = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                props.token.value,
                {
                    owner: {
                        $eq: user.id,
                    },
                    $sort: [
                        {
                            $field_name: 'created_at',
                            $order: 'desc',
                        },
                    ],
                },
            ],
            refreshRate: 60,
        },
        uuid,
    );

    if (eventsReq.response.loading) {
        return <FullPageLoading />;
    }

    if (isRequestError(eventsReq)) {
        return <Error message={t('cannot_reach_server')} retryLabel={t('retrying_in')} onRefresh={eventsReq.force} />;
    }

    return <EventsContext.Provider value={eventsReq}>{props.children}</EventsContext.Provider>;
};

interface LoggedOutEventsGuardProps {
    token: Token;
}

const LoggedOutEventsGuard: React.FC<PropsWithChildren<LoggedOutEventsGuardProps>> = (
    props: PropsWithChildren<LoggedOutEventsGuardProps>,
) => {
    return (
        <EventsContext.Provider
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
        </EventsContext.Provider>
    );
};

export const EventsContextGuard: React.FC<{}> = (props) => {
    const token = useSelector((state: AppState) => state.auth.token);

    if (token === undefined) {
        return <FullPageLoading />;
    }

    if (token === null) {
        return <LoggedOutEventsGuard token={token}>{props.children}</LoggedOutEventsGuard>;
    }

    return <LoggedInEventsGuard token={token}>{props.children}</LoggedInEventsGuard>;
};
