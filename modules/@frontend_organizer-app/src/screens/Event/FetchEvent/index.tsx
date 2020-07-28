import React, { useState }             from 'react';
import { useParams, useHistory }       from 'react-router';
import { useTranslation }           from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { v4 }                       from 'uuid';

import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { AppState }                    from '@frontend/core/src/redux/ducks';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';

import '../../../shared/Translations/global';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import './locales';
import { EventsSearchResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';

const FetchEvent = (): JSX.Element => {
    const [ t ] = useTranslation(['fetch_event', 'global']);
    const [uuid] = useState(v4() + '@fetchDate');
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const { groupId } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const [ emptyDateFetched, setEmptyDateFetched ] = useState<boolean>(false);

    const { response: eventsResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    const { response: datesResp } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    const { response: globalCategoriesResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    },
                    parent_type: {
                        $eq: 'event',
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    useDeepEffect(() => {
        if (datesResp.data?.dates) {
            const filteredDates = datesResp.data.dates.filter(d => d.parent_type === 'event');
            if (filteredDates.length > 0) {
                history.push(`/group/${groupId}/date/${filteredDates[0].id}`);
            } else {
                setEmptyDateFetched(true);
            }
        }
    }
    , [datesResp.data]);

    useDeepEffect(() => {
            if (emptyDateFetched && globalCategoriesResp.data?.categories) {
                if (globalCategoriesResp.data.categories.length > 0) {
                    const defaultGlobalCategory = globalCategoriesResp.data.categories[0];
                    dispatch(PushNotification(t('no_dates_on_event'), 'warning'));
                    history.push(`/group/${groupId}/event/${defaultGlobalCategory.parent_id}/category/${defaultGlobalCategory.id}`);
                } else {
                    if (eventsResp.data.events) {
                        if (eventsResp.data.events.length === 0) {
                            history.push('/');
                        } else {
                            dispatch(PushNotification(t('empty_event'), 'warning'));
                            history.push(`/group/${groupId}/event/${eventsResp.data.events[0].id}/date`);
                        }
                    }
                }
            }
        }
        , [globalCategoriesResp.data, emptyDateFetched, eventsResp.data]);

    return (
      <>
        {t('global:loading')}
      </>
    );
};

export default FetchEvent;
