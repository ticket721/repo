import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/ducks';
import { v4 } from 'uuid';
import { useRequest } from '../../../hooks/useRequest';
import { MetadatasFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/metadatas/dto/MetadatasFetchResponse.dto';
import { ActivitiesList } from './ActivitiesList';

const Activities: React.FC = () => {
    const [uuid] = useState(v4());
    const { token, userUuid } = useSelector((state: AppState) => ({
        token: state.auth.token?.value,
        userUuid: state.auth.user?.uuid,
    }));

    const { response, force } = useRequest<MetadatasFetchResponseDto>(
        {
            method: 'metadatas.fetch',
            args: [
                token,
                {
                    useReadRights: [
                        {
                            id: userUuid,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    withLinks: [
                        {
                            id: userUuid,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    metadataClassName: 'history',
                },
            ],
            refreshRate: 50,
        },
        uuid,
    );

    return <ActivitiesList loading={response.loading} error={response.error} data={response.data} force={force} />;
};

export default Activities;
