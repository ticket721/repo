import React, { useState }         from 'react';
import { Error, FullPageLoading }  from '@frontend/flib-react/lib/components';
import { v4 }                      from 'uuid';
import { useSelector }             from 'react-redux';
import { StaffAppState }           from '../../redux';
import { useRequest }              from '@frontend/core/lib/hooks/useRequest';
import { useTranslation }          from 'react-i18next';
import { RightsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/rights/dto/RightsSearchResponse.dto';
import { EventsDatesFetcher }      from '../EventsDatesFetcher';
import styled                      from 'styled-components';
import { GuestListFetcher }        from './GuestListFetcher';
import '../locales';

const GuestList: React.FC = () => {
    const [ t ] = useTranslation(['fetch_errors', 'common']);
    const [uuid] = useState(v4() + '@guestlist-page');
    const [ token, dateId ] = useSelector((state: StaffAppState) => [ state.auth.token.value, state.currentEvent.dateId ]);

    const rightsReq = useRequest<RightsSearchResponseDto>({
        method: 'rights.search',
        args: [
            token,
            {
                entity_type: {
                    $eq: 'event'
                }
            }
        ],
        refreshRate: 1,
    }, uuid);

    if (rightsReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (rightsReq.response.error) {
        return <Error message={t('error_cannot_fetch_events')} retryLabel={t('common:retrying_in')} onRefresh={rightsReq.force}/>;
    }

    if (rightsReq.response.data.rights.length === 0) {
        return <NoEvent>{t('no_event')}</NoEvent>
    }

    return (
        <EventsDatesFetcher uuid={uuid} entities={rightsReq.response.data.rights.map(right => right.entity_value)}>
            {
                dateId ?
                    <GuestListFetcher/> :
                    null
            }
        </EventsDatesFetcher>
    );
};

const NoEvent = styled.span`
    width: 100%;
    text-align: center;
`;

export default GuestList;
