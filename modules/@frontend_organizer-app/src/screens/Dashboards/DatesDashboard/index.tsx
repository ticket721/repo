import React, { useState } from 'react';
import { v4 }                         from 'uuid';

import { useRequest }              from '@frontend/core/lib/hooks/useRequest';

import { useTranslation }  from 'react-i18next';
import './locales';
import { FullPageLoading, Error, Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import './locales';
import { DateCard } from './DateCard';
import { useHistory, useParams } from 'react-router';
import { eventParam } from '../../types';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { PreviewBanner } from '../../../components/PreviewBanner';

export const DatesDashboard: React.FC = () => {
    const [ t ] = useTranslation('dates_dashboard');

    const history = useHistory();

    const [fetchDatesUuid] = useState(v4() + '@dates-dashboard');
    const token = useToken();

    const { eventId } = useParams<eventParam>();

    const { response: datesResp, force: forceDates } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                event: {
                    $eq: eventId
                },
                $sort: [{
                    $field_name: 'timestamps.event_end',
                    $order: 'asc',
                }]
            }
        ],
        refreshRate: 50
    }, fetchDatesUuid);

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return <Error message={t('dates_fetch_error')} onRefresh={forceDates}/>;
    }

    return (
        <DatesDashboardContainer>
            <PreviewBanner/>
            {
                datesResp.data.dates.length > 0 ?
                datesResp.data.dates.map(date =>
                    <DateCard
                    key={date.id}
                    id={date.id}
                    name={date.metadata.name}
                    online={date.online}
                    avatar={date.metadata.avatar}
                    primaryColor={date.metadata.signature_colors[0]}
                    categoryIds={date.categories}
                    />
                ) :
                <NoDate>
                    <NoDateMsg>{t('no_date_msg')}</NoDateMsg>
                    <Button
                    title={t('create_date')}
                    variant={'primary'}
                    onClick={() => history.push(`/event/${eventId}/date`)}/>
                </NoDate>
            }
        </DatesDashboardContainer>
    )
};

const DatesDashboardContainer = styled.div`
    width: calc(100% - 100px);
    display: flex;
    flex-wrap: wrap;

    & > div {
        margin-bottom: ${props => props.theme.doubleSpacing};
        margin-right: ${props => props.theme.doubleSpacing};
    }

    @media screen and (min-width: 1500px) {
        & > div:nth-child(3n+3) {
            margin-right: 0;
        }
    }

    @media screen and (max-width: 1500px) {
        & > div:nth-child(2n+2) {
            margin-right: 0;
        }
    }

    @media screen and (max-width: 900px) {
        & > div {
            margin-right: 0;
        }
    }
`;

const NoDate = styled.div`
    width: 100%;
    text-align: center;
`;

const NoDateMsg = styled.span`
`;
