import React, { useEffect, useState }           from 'react';
import { useRequest }                           from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto }              from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { v4 }                                   from 'uuid';
import { useToken }                             from '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error, Icon, Button } from '@frontend/flib-react/lib/components';
import { useTranslation }                       from 'react-i18next';
import './locales';
import { useHistory, useRouteMatch }            from 'react-router';
import { eventParam }                           from '../../../screens/types';
import styled                                   from 'styled-components';
import { DatesSearchResponseDto }               from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { EventsStatusResponseDto }              from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsStatusResponse.dto';
import { CategoriesSubMenu }                    from './CategoriesSubMenu';
import { AnimateSharedLayout, motion }          from 'framer';
import { DatesSubMenu }                         from './DatesSubMenu';
import { useDeepEffect }                        from '@frontend/core/lib/hooks/useDeepEffect';
import { useLazyRequest }                       from '@frontend/core/lib/hooks/useLazyRequest';
import { useDispatch }                          from 'react-redux';
import { PushNotification }                     from '@frontend/core/lib/redux/ducks/notifications';

export const EventMenu: React.FC = () => {
    const [t] = useTranslation('event_menu');
    const token = useToken();
    const [fetchEventUuid] = useState<string>(v4() + '@event-search');
    const [fetchDatesUuid] = useState<string>(v4() + '@dates-search');
    const [publishEventUuid] = useState<string>(v4() + '@publish');

    const dispatch = useDispatch();
    const match = useRouteMatch<eventParam>('/event/:eventId');

    const [params, setParams] = useState<eventParam>();

    const history = useHistory();

    const { response: eventResp, force: forceEvent } = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                id: {
                    $eq: params?.eventId,
                },
            },
        ],
        refreshRate: 50,
    }, fetchEventUuid);

    const { response: datesResp, force: forceDates } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                event: {
                    $eq: params?.eventId,
                },
                $sort: [{
                    $field_name: 'timestamps.event_end',
                    $order: 'asc',
                }],
            },
        ],
        refreshRate: 50,
    }, fetchDatesUuid);

    const { response: publishResp, lazyRequest: publish } = useLazyRequest<EventsStatusResponseDto>('events.status', publishEventUuid);

    useEffect(() => {
        forceEvent();
        forceDates();
        // eslint-disable-next-line
    }, []);

    useDeepEffect(() => {
        if (match?.params) {
            setParams(match.params);
        }
    }, [match?.params]);

    useEffect(() => {
        if (publishResp.data?.event) {
            dispatch(PushNotification(t('publish_success'), 'success'));
            forceEvent();
            forceDates();
        }
        // eslint-disable-next-line
    }, [publishResp.data?.event]);

    useEffect(() => {

        if (publishResp.error) {
            switch (publishResp.error.response.data.message) {
                case 'no_stripe_interface_bound':
                    dispatch(PushNotification(t('no_stripe_interface'), 'warning'));
                    history.push('/stripe/connect');
                    break;
                case 'stripe_interface_not_ready':
                    dispatch(PushNotification(t('stripe_not_ready'), 'warning'));
                    history.push('/stripe/connect');
                    break;
                default:
                    dispatch(PushNotification(t('invalid_stripe_interface'), 'error'));
                    history.push('/stripe/connect');
                    break;
            }
        }
        // eslint-disable-next-line
    }, [publishResp.error]);

    if (eventResp.loading || datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (eventResp.error || datesResp.error) {
        return <Error message={t('event_fetch_error')} onRefresh={() => {
            forceEvent();
            forceDates();
        }}/>;
    }

    return <EventMenuContainer>
        <AnimateSharedLayout>
            <Title
                focused={history.location.pathname.endsWith('/edit')}
                onClick={() => history.push(`/event/${params.eventId}/edit`)}>
                {eventResp.data.events[0].name}
                <Icon className={'edit'} icon={'edit'} size={'18px'} color={'white'}/>
                {
                    history.location.pathname.endsWith('/edit') ?
                        <Arrow layoutId={'selected'}/> :
                        null
                }
                <PublishBtn>
                    <Button
                        title={t(eventResp.data.events[0].status === 'preview' ? 'publish' : 'published')}
                        variant={eventResp.data.events[0].status === 'preview' ? 'primary' : 'disabled'}
                        onClick={() => {
                            const dates: string[] = eventResp.data.events[0].dates;
                            const categories: string[] = [...new Set(datesResp.data.dates.flatMap(date => date.categories))];
                            publish([
                                token,
                                params?.eventId,
                                {
                                    event: true,
                                    dates: dates.reduce((acc: any, date: string) => {
                                        acc[date] = true;
                                        return acc;
                                    }, {}),
                                    categories: categories.reduce((acc: any, category: string) => {
                                        acc[category] = true;
                                        return acc;
                                    }, {}),
                                },
                                v4(),
                            ]);
                        }
                        }/>
                </PublishBtn>
            </Title>
            <DatesSubMenu/>
            <CategoriesSubMenu/>
        </AnimateSharedLayout>
    </EventMenuContainer>;
};

const EventMenuContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.div<{ focused: boolean }>`
    position: sticky;
    top: 38px;
    z-index: 1;
    cursor: pointer;
    font-weight: 600;
    text-transform: uppercase;
    padding: ${props => props.theme.regularSpacing} ${props => props.theme.doubleSpacing} 0 ${props => props.theme.regularSpacing};
    background-color: ${props => props.theme.darkerBg};
    font-size: 16px;
    line-height: 25px;

    .edit {
        opacity: ${props => props.focused ? 1 : 0};
        display: inline;
        margin-left: 16px;
    }

    :hover {
        .edit {
            opacity: 1;
        }
    }
`;

const PublishBtn = styled.div`
    padding: 0 ${props => props.theme.smallSpacing} ${props => props.theme.smallSpacing};
`;

const Arrow = styled(motion.div)`
    position: absolute;
    top: 20px;
    right: 0;
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 12px solid #0c0915;
`;
