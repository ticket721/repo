import React, { useState }        from 'react';
import styled                     from 'styled-components';
import { useTranslation }         from 'react-i18next';
import './locales';
import { useSavedEvents }         from '../../utils/useSavedEvents';
import { v4 }                     from 'uuid';
import { useToken }               from '@frontend/core/lib/hooks/useToken';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { isRequestError }         from '@frontend/core/lib/utils/isRequestError';
import { DateEntity }             from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { HomeEvent }              from '../Home/EventList/HomeEvent';

const Container = styled.div`
  width: 100vw;
`;

const EventContainer = styled.div`
    display: flex;
    padding: ${props => props.theme.smallSpacing};
    flex-wrap: wrap;
`;

const Body = styled.div`
  height: 80vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyMessage = styled.p`
  font-weight: 400;
`;

const SavedEventsFetcher = () => {

    const [savedEvents] = useSavedEvents();
    const [uuid] = useState(v4());
    const token = useToken();
    const [t] = useTranslation(['home', 'common']);

    const dates = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $in: savedEvents
                    },
                    status: {
                        $eq: 'live'
                    }
                },
            ],
            refreshRate: 100,
        },
        `SavedEventList@${uuid}`,
    );

    if (dates.response.loading) {
        return <FullPageLoading
            width={250}
            height={250}
        />
    }

    if (isRequestError(dates)) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={dates.force}/>
    }

    if (dates.response.data.dates.length === 0) {
        return <Body>
            <EmptyMessage>{t('no_liked_events')}</EmptyMessage>
        </Body>
    }

    return <EventContainer>
        {
            dates.response.data.dates.map(
                (date: DateEntity, idx: number) => <HomeEvent key={idx} idx={idx} date={date}/>
            )
        }
    </EventContainer>;

}

const Tags: React.FC = () => {

    const [t] = useTranslation('tags');
    const [savedEvents] = useSavedEvents();

    return <Container>
        {
            savedEvents.length === 0

                ?
                <Body>
                    <EmptyMessage>{t('no_liked_events')}</EmptyMessage>
                </Body>

                :
                <SavedEventsFetcher/>
        }
    </Container>
};

export default Tags;
