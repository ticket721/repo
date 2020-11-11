import React, { useEffect, useState } from 'react';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { v4 } from 'uuid';
import { useToken } from  '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { useHistory, useRouteMatch } from 'react-router';
import { categoryParam, dateParam, eventParam } from '../../../screens/types';
import styled from 'styled-components';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSubMenu } from './CategoriesSubMenu';
import { AnimateSharedLayout, motion } from 'framer';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { format } from '@frontend/core/lib/utils/date';
import { OnlineTag } from '../../OnlineTag';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';

export const DateMenu: React.FC = () => {
    const [ t ] = useTranslation('date_menu');
    const token = useToken();
    const [fetchEventUuid] = useState<string>(v4() + '@event-search');
    const [fetchDateUuid] = useState<string>(v4() + '@date-search');

    const match = useRouteMatch<eventParam & dateParam & categoryParam>([
        '/event/:eventId/date/:dateId/category/:categoryId',
        '/event/:eventId/date/:dateId']);

    const [  params, setParams ] = useState<eventParam & dateParam & categoryParam>();
    const history = useHistory();

    const { response: eventResp, force: forceEvent } = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                id: {
                    $eq: params?.eventId
                }
            },
        ],
        refreshRate: 50,
    }, fetchEventUuid);

    const { response: dateResp, force: forceDate } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: params?.dateId
                }
            },
        ],
        refreshRate: 50,
    }, fetchDateUuid);

    useEffect(() => {
        forceDate();
    // eslint-disable-next-line
    }, []);

    useDeepEffect(() => {
        if (match?.params) {
            setParams(match.params);
        }
    }, [match?.params]);

    if (dateResp.loading || eventResp.loading) {
        return <FullPageLoading/>;
    }

    if (eventResp.error) {
        return <Error message={t('event_fetch_error')} onRefresh={forceEvent}/>;
    }

    if (dateResp.error) {
        return <Error message={t('date_fetch_error')} onRefresh={forceDate}/>;
    }

    return <>
            <Header>
                <EventTitle>{eventResp.data.events[0].name}</EventTitle>
                <Title>
                    {dateResp.data.dates[0].metadata.name}
                    {
                        dateResp.data.dates[0].online ?
                        <OnlineTag/> :
                        null
                    }
                </Title>
                <DateRange>
                    {t('from')}&nbsp;
                    <strong>{format(dateResp.data.dates[0].timestamps.event_begin)}</strong>
                    &nbsp;{t('to')}&nbsp;
                    <strong>{format(dateResp.data.dates[0].timestamps.event_end)}</strong>
                </DateRange>
            </Header>
            <AnimateSharedLayout>
                <EditDateContainer selectedEdit={history.location.pathname.substring(history.location.pathname.lastIndexOf('/') + 1)}>
                        <EditTitle>{t('edit_title')}</EditTitle>
                        <Link
                        key={'dates_and_typology'}
                        selected={history.location.pathname.endsWith('/dates-typology')}
                        onClick={() => history.push(`/event/${dateResp.data.dates[0].event}/date/${params.dateId}/dates-typology`)}>
                            {t('dates_and_typology')}
                            {
                                history.location.pathname.endsWith('/dates-typology') ?
                                <Arrow layoutId={'selected'}/> :
                                null
                            }
                        </Link>
                        <Link
                        key={'general_infos'}
                        selected={history.location.pathname.endsWith('/general-infos')}
                        onClick={() => history.push(`/event/${dateResp.data.dates[0].event}/date/${params.dateId}/general-infos`)}>
                            {t('general_infos')}
                            {
                                history.location.pathname.endsWith('/general-infos') ?
                                <Arrow layoutId={'selected'}/> :
                                null
                            }
                        </Link>
                        <Link
                        key={'styles'}
                        selected={history.location.pathname.endsWith('/styles')}
                        onClick={() => history.push(`/event/${dateResp.data.dates[0].event}/date/${params.dateId}/styles`)}>
                            {t('styles')}
                            {
                                history.location.pathname.endsWith('/styles') ?
                                <Arrow layoutId={'selected'}/> :
                                null
                            }
                        </Link>
                </EditDateContainer>
                <CategoriesSubMenu/>
            </AnimateSharedLayout>
    </>;
}

const Header = styled.div`
    position: sticky;
    top: 38px;
    padding-top: ${props => props.theme.biggerSpacing};
    background-color: ${props => props.theme.darkerBg};
    z-index: 1;
`;

const EventTitle = styled.div`
    font-weight: 600;
    margin: 0 ${props => props.theme.regularSpacing} 4px;
    font-size: 10px;
    color: ${props => props.theme.textColorDarker};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    font-weight: 600;
    text-transform: uppercase;
    margin: 0 ${props => props.theme.doubleSpacing} ${props => props.theme.smallSpacing} ${props => props.theme.regularSpacing};
    font-size: 16px;
    line-height: 25px;

    > div {
        margin-left: ${props => props.theme.smallSpacing};
        text-transform: capitalize;
        span {
            line-height: 8px;
        }
    }
`;

const DateRange = styled.div`
    display: flex;
    padding: 0 ${props => props.theme.regularSpacing} ${props => props.theme.regularSpacing};
    font-size: 12px;
    color: ${props => props.theme.textColorDark};

    strong {
        color: ${props => props.theme.textColor};
        font-weight: 500;
    }
`;

const EditDateContainer = styled.div<{ selectedEdit: string }>`
    background-color: ${props => props.theme.darkBg};
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} calc(${props => props.theme.biggerSpacing} / 2);
`;

const EditTitle = styled.div`
    padding-bottom: calc(${props => props.theme.biggerSpacing} / 2);
    font-size: 14px;
    font-weight: 500;
`;

const Link = styled.div<{ selected?: boolean }>`
    position: relative;
    cursor: pointer;
    padding: calc(${props => props.theme.biggerSpacing} / 2) 0 calc(${props => props.theme.biggerSpacing} / 2) ${props => props.theme.regularSpacing};
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.selected ? props.theme.textColor : props.theme.textColorDarker};
`;

const Arrow = styled(motion.div)`
    position: absolute;
    top: 5px;
    right: -24px;
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 12px solid #0c0915;
`;
