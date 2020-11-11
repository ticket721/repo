import React, { useState }            from 'react';
import { v4 }                         from 'uuid';
import { DatesSearchResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading }     from '@frontend/flib-react/lib/components';
import { DateEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { HomeEvent }                  from './HomeEvent';
import { UserLocation } from '../../../redux';
import { useRequest }                 from '@frontend/core/lib/hooks/useRequest';
import { useTranslation }             from 'react-i18next';
import { isRequestError }             from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';

interface HomeEventListProps {
    location: UserLocation;
    requesting: boolean;
}

export const HomeEventList: React.FC<HomeEventListProps> = (props: HomeEventListProps): JSX.Element => {

    const [uuid] = useState(v4());
    const token = useToken();
    const [t] = useTranslation(['home', 'common']);

    const dates = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.homeSearch',
            args: [
                token,
                {
                    lat: props.location.lat,
                    lon: props.location.lon,
                },
            ],
            refreshRate: 100,
        },
        `HomeEventList@${uuid}`,
    );

    if (dates.response.loading || props.requesting) {
        return <FullPageLoading
            width={250}
            height={250}
        />
    }

    if (isRequestError(dates)) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={dates.force}/>
    }

    return <div style={{padding: '5%'}}>
        {
            dates.response.data.dates.map(
                (date: DateEntity, idx: number) => <HomeEvent key={idx} idx={idx} date={date}/>
            )
        }
    </div>;
};

