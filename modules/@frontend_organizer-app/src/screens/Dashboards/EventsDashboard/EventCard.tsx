import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { useTranslation }  from 'react-i18next';
import styled from 'styled-components';
import { formatDay } from '@frontend/core/lib/utils/date';
import { useHistory } from 'react-router';

export interface EventCardProps {
    id: string;
    name: string;
    avatar: string;
    primaryColor: string;
    dateIds: string[];
}

export const EventCard: React.FC<EventCardProps> = ({ id, name, avatar, primaryColor, dateIds }) => {
    const [ t ] = useTranslation('events_dashboard');
    const token = useToken();

    const history = useHistory();

    const [fetchDatesUuid] = useState(v4() + '@dates-fetch');

    const [ dateRange, setDateRange ] = useState<{ start: string, end: string }>();

    const { response: datesResp, force: forceDates } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $in: dateIds
                },
                $sort: [{
                    $field_name: 'timestamps.event_begin',
                    $order: 'asc',
                }]
            },
        ],
        refreshRate: 50,
    }, fetchDatesUuid);

    useEffect(() => {
        if (datesResp.data?.dates) {
            const endDate = datesResp.data.dates
            .map(date => date.timestamps.event_end)
            .sort((date, nextDate)  => Date.parse(nextDate) - Date.parse(date))[0];
            setDateRange({
                start: formatDay(datesResp.data.dates[0].timestamps.event_begin),
                end: formatDay(endDate),
            });
        }
    // eslint-disable-next-line
    }, [datesResp.data?.dates]);

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return <Error message={t('dates_fetch_error')} onRefresh={forceDates}/>;
    }

    return <EventCardContainer
    cover={avatar}
    onClick={() => history.push(`/event/${id}`)}>
            <Filter/>
            <Name>{name}</Name>
            {
                datesResp.data.dates.length > 0 ?
                <DateRange primaryColor={primaryColor}>
                    {t('from')}&nbsp;<strong>{dateRange?.start || '___'}</strong>&nbsp;{t('to')}&nbsp;<strong>{dateRange?.end || '___'}</strong>
                </DateRange> :
                null
            }
    </EventCardContainer>;
};

const EventCardContainer = styled.div<{ cover: string }>`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 400px;
    width: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) / 3);
    height: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) * (3/16));
    background: url(${props => props.cover});
    background-size: cover;
    padding: ${props => props.theme.biggerSpacing};
    border-radius: ${props => props.theme.defaultRadius};
    cursor: pointer;

    @media screen and (max-width: 1500px) {
        width: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) / 2);
        height: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) * (9/32));
    }

    @media screen and (max-width: 900px) {
        width: calc(100vw - 450px);
        height: calc((100vw - 450px) * (9/16));
    }
`;

const Filter = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    border-radius: ${props => props.theme.defaultRadius};
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 15%, transparent);
`;

const Name = styled.span`
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: ${props => props.theme.smallSpacing};
    z-index: 1;
`;

const DateRange = styled.span<{ primaryColor: string }>`
    font-size: 14px;
    z-index: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;

    strong {
        color: ${props => props.primaryColor};
        text-shadow: 0 0 1px ${props => props.primaryColor};
    }
`;
