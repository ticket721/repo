import React, { useState }        from 'react';
import { useDeepEffect }          from '@frontend/core/lib/hooks/useDeepEffect';
import { v4 }                     from 'uuid';
import { useSelector }            from 'react-redux';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useParams }              from 'react-router';
import { StylesForm }             from './Form';
import { MergedAppState }         from '../../../index';
import { DateMetadata }           from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { FullPageLoading }           from '@frontend/flib-react/lib/components';

const UpdateStyles: React.FC = () => {
    const [ metadata, setMetadata ] = useState<DateMetadata>(null);
    const { dateId } = useParams();

    const [uuid] = React.useState(v4() + '@update-styles');
    const token = useSelector((state: MergedAppState): string => state.auth.token.value);
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
            setMetadata(dateResp.data.dates[0].metadata)
        }
    }, [dateResp.data]);

    if (metadata) {
        return (
            <StylesForm
            uuid={uuid}
            dateId={dateId}
            initialValues={metadata}/>
        )
    } else {
        return <FullPageLoading/>
    }
};

export default UpdateStyles;
