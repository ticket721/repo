import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { v4 } from 'uuid';
import { useSelector } from 'react-redux';

import { RightsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/rights/dto/RightsSearchResponse.dto';

import { useLazyRequest } from '../../hooks/useLazyRequest';
import { useDeepEffect } from '../../hooks/useDeepEffect';
import { AppState } from '../../redux/ducks';
import { useParams } from 'react-router';

interface ProtectedByRightsProps {
    children: React.ReactNode;
    type?: string;
    value?: 'groupId' | 'dateId' | 'categoryId' | 'eventId';
}

const ProtectedByRights = ({ children, type, value }: ProtectedByRightsProps): JSX.Element => {
    const [uuid] = useState(v4() + '@protectedByRights');
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const [currentRights, setCurrentRights] = useState();
    const params = useParams();

    const { lazyRequest, response: rights } = useLazyRequest<RightsSearchResponseDto>('rights.search', uuid);

    useEffect(() => {
        if (type && value) {
            lazyRequest([token, { entity_type: { $eq: type }, entity_value: { $eq: params[value] } }], { force: true });
        } else if (type) {
            lazyRequest([token, { entity_type: { $eq: type } }], { force: true });
        } else if (value) {
            lazyRequest([token, { entity_value: { $eq: params[value] } }], { force: true });
        } else {
            lazyRequest([token, {}], { force: true });
        }
        // eslint-disable-next-line
    }, []);

    useDeepEffect(() => {
        if (rights.called && !rights.loading && rights.data) {
            setCurrentRights(rights.data.rights.filter((r) => r.rights.owner === true));
        }
    }, [rights.called, rights.loading]);

    if (rights.called && rights.loading) {
        return <>Loading...</>;
    }

    if (currentRights && currentRights.length > 0) {
        return <>{children}</>;
    } else if (currentRights && currentRights.length === 0) {
        return <Redirect to={'/'} />;
    } else {
        return <></>;
    }
};

export default ProtectedByRights;
