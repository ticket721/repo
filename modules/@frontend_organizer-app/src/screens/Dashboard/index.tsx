import React, { useState } from 'react';
import { useDispatch, useSelector }   from 'react-redux';
import { v4 }                         from 'uuid';

import { useRequest }              from '@frontend/core/lib/hooks/useRequest';
import { AppState }                from '@frontend/core/src/redux/ducks';

import './locales';
import { RightsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/rights/dto/RightsSearchResponse.dto';
import { EventsFetcher }           from './EventsFetcher';
import { useHistory }              from 'react-router';
import { PushNotification }        from '@frontend/core/lib/redux/ducks/notifications';

import { useTranslation } from 'react-i18next';
import './locales';
import { useDeepEffect }  from '@frontend/core/lib/hooks/useDeepEffect';

const Dashboard: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [ t ] = useTranslation('dashboard');

    const [uuid] = useState(v4() + '@dashboard');
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const [ groupIds, setGroupIds ] = useState<string[]>();

    const { response: eventRights } = useRequest<RightsSearchResponseDto>(
        {
            method: 'rights.search',
            args: [
                token,
                {
                    entity_type: 'event'
                }
            ],
            refreshRate: 1
        },
        uuid,
    );

    useDeepEffect(() => {
        if (eventRights.data && eventRights.data.rights.length > 0) {
            setGroupIds(eventRights.data.rights.map((right) => right.entity_value));
        }

        if (
            !eventRights.loading
            && !eventRights.error
            && eventRights.data?.rights.length === 0
        ) {
            dispatch(PushNotification(t('no_result_notif'), 'info'));
            history.push('/create-event');
        }

        if (eventRights.error) {
            dispatch(PushNotification(t('error_notif'), 'error'));
        }
    }, [eventRights]);

    return (
        <>
            {
                groupIds ?
                    <EventsFetcher
                    token={token}
                    uuid={uuid}
                    groupIds={groupIds}/> :
                    null
            }
            {
                eventRights.loading ?
                    <span>{t('loading_label')}</span> :
                    null
            }
        </>
    )
};

export default Dashboard;
