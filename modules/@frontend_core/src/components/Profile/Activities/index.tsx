import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/ducks';
import { v4 } from 'uuid';
import { useRequest } from '../../../hooks/useRequest';
import { MetadatasFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/metadatas/dto/MetadatasFetchResponse.dto';
import { ActivitiesList } from './ActivitiesList';
import { UserContext } from '../../../utils/UserContext';

const Activities: React.FC = () => {
    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({
        token: state.auth.token?.value,
    }));
    const user = useContext(UserContext);

    const response = useRequest<MetadatasFetchResponseDto>(
        {
            method: 'metadatas.fetch',
            args: [
                token,
                {
                    useReadRights: [
                        {
                            id: user.id,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    withLinks: [
                        {
                            id: user.id,
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

    return <ActivitiesList response={response} />;
};

export default Activities;
