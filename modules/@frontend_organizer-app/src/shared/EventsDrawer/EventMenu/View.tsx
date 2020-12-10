import React, { useContext, useEffect, useState } from 'react';
import { v4 }                                   from 'uuid';
import { useToken }                             from '@frontend/core/lib/hooks/useToken';
import { Icon, Button } from '@frontend/flib-react/lib/components';
import { useTranslation }                       from 'react-i18next';
import './locales';
import { useHistory }            from 'react-router';
import styled                          from 'styled-components';
import { EventsStatusResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsStatusResponse.dto';
import { CategoriesSubMenu }           from './CategoriesSubMenu';
import { AnimateSharedLayout, motion } from 'framer';
import { DatesSubMenu }                from './DatesSubMenu';
import { useLazyRequest, RequestResp } from '@frontend/core/lib/hooks/useLazyRequest';
import { useDispatch }                 from 'react-redux';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { Dispatch }                    from 'redux';
import { DatesContext }                from '../../../components/Fetchers/DatesFetcher';
import { EventsContext }               from '../../../components/Fetchers/EventsFetcher';
import { CategoriesContext }           from '../../../components/Fetchers/CategoriesFetcher';
import { StatsSubMenu }                from './StatsSubMenu';

const handleStatus = (req: RequestResp<EventsStatusResponseDto>, history: any, dispatch: Dispatch, t: any): void => {
    switch (req.error.response.data.message) {
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

export const EventMenuView: React.FC<{ eventId: string }> = ({ eventId }) => {
    const [t] = useTranslation('event_menu');
    const token = useToken();
    const [publishEventUuid] = useState<string>(v4() + '@publish');

    const { events, forceFetch: fetchEvents } = useContext(EventsContext);
    const { dates, forceFetch: fetchDates } = useContext(DatesContext);
    const { categories, forceFetch: fetchCategories } = useContext(CategoriesContext);

    const dispatch = useDispatch();

    const history = useHistory();

    const { response: publishResp, lazyRequest: publish } = useLazyRequest<EventsStatusResponseDto>('events.status', publishEventUuid);

    useEffect(() => {
        if (publishResp.data?.event) {
            dispatch(PushNotification(t('publish_success'), 'success'));
            fetchEvents();
            fetchDates();
            fetchCategories();
        }
        // eslint-disable-next-line
    }, [publishResp.data?.event]);

    useEffect(() => {
        if (publishResp.error) {
            handleStatus(publishResp, history, dispatch, t);
        }
        // eslint-disable-next-line
    }, [publishResp.error]);

    return <EventMenuContainer>
        <AnimateSharedLayout>
            <Title
                focused={history.location.pathname.endsWith('/edit')}
                onClick={() => history.push(`/event/${eventId}/edit`)}>
                {events[0].name}
                <Icon className={'edit'} icon={'edit'} size={'18px'} color={'white'}/>
                {
                    history.location.pathname.endsWith('/edit') ?
                        <Arrow layoutId={'selected'}/> :
                        null
                }
                <PublishBtn>
                    <Button
                        title={t(events[0].status === 'preview' ? 'publish' : 'published')}
                        variant={events[0].status === 'preview' ? 'primary' : 'disabled'}
                        onClick={() => {
                            const dateIds: string[] = events[0].dates;
                            const categoryIds: string[] = [...new Set(dates.flatMap(date => date.categories))];
                            publish([
                                token,
                                eventId,
                                {
                                    event: true,
                                    dates: dateIds.reduce((acc: any, date: string) => {
                                        acc[date] = true;
                                        return acc;
                                    }, {}),
                                    categories: categoryIds.reduce((acc: any, category: string) => {
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
            <DatesSubMenu eventId={eventId} dates={dates}/>
            <CategoriesSubMenu categories={categories} dateCount={dates.length}/>
            <StatsSubMenu eventId={eventId}/>
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
