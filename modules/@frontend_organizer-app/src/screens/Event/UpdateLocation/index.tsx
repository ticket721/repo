import React, { useState }        from 'react';
import { useDeepEffect }          from '@frontend/core/lib/hooks/useDeepEffect';
import { v4 }                     from 'uuid';
import { useSelector }            from 'react-redux';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useParams }              from 'react-router';
import { LocationForm }           from './Form';
import { AppState } from '@frontend/core/lib/redux';
import { InputDateLocation }      from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { FullPageLoading }           from '@frontend/flib-react/lib/components';

const UpdateLocation: React.FC = () => {
    const [ location, setLocation ] = useState<InputDateLocation>(null);
    const { dateId } = useParams();

    const [uuid] = React.useState(v4() + '@update-location');
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const { response: dateResp } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $eq: dateId,
                    }
                },
            ],
            refreshRate: 1,
        },
        uuid
    );

    useDeepEffect(() => {
        if (dateResp.data && dateResp.data.dates.length > 0) {
            setLocation({
                location_label: dateResp.data.dates[0].location.location_label,
                location: dateResp.data.dates[0].location.location,
            });
        }
    }, [dateResp.data]);

    if (location) {
        return (
            <LocationForm
                uuid={uuid}
                dateId={dateId}
                initialValues={location}/>
        )
    } else {
        return <FullPageLoading/>
    }
};

export default UpdateLocation;
