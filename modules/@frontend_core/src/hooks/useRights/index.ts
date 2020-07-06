import { useSelector } from 'react-redux';
import { AppState } from '../../redux/ducks';
import { useRequest } from '../useRequest';
import { useState } from 'react';
import { v4 } from 'uuid';
import { RightsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/rights/dto/RightsSearchResponse.dto';

interface RightsParams {
    entityValue?: string;
    entityType?: string;
    pageSize?: number;
}

interface RequestResp {
    entities: string[];
    error: any;
    loading: boolean;
    empty: boolean;
}

export const useRights = (params: RightsParams): RequestResp => {
    const [uuid] = useState<string>(v4() + '@rights');
    const token = useSelector((state: AppState) => state.auth.token.value);

    const { response: rightsResp } = useRequest<RightsSearchResponseDto>(
        {
            method: 'rights.search',
            args: [
                token,
                {
                    entity_type: {
                        $eq: params.entityType,
                    },
                    entity_value: {
                        $eq: params.entityValue,
                    },
                    $page_size: params.pageSize ? params.pageSize : 10,
                },
            ],
            refreshRate: 5,
        },
        uuid,
    );
    return {
        entities: rightsResp.data?.rights,
        error: rightsResp.error,
        loading: rightsResp.loading,
        empty: rightsResp.data?.rights.length === 0,
    };
};
