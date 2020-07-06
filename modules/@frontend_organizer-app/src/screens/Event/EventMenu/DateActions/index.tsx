import React, { useState } from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams } from 'react-router';
import { Button }  from '@frontend/flib-react/lib/components';

import { useTranslation }           from 'react-i18next';
import './locales';
import { useDispatch, useSelector } from 'react-redux';
import { MergedAppState }           from '../../../../index';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { v4 }                       from 'uuid';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';

export const DateActions: React.FC = () => {
    const [ t ] = useTranslation('date_actions');
    const history = useHistory();
    const dispatch = useDispatch();
    const token = useSelector((state: MergedAppState): string => state.auth.token.value);
    const [uuid] = useState<string>(v4() + '@date-actions');
    const { groupId, dateId } = useParams();

    const { response: dateResp } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: dateId
                }
            }
        ],
        refreshRate: 2,
    },
        uuid);

    return (
        <Container>
            {
                dateResp.data?.dates && dateResp.data?.dates?.[0]?.status === 'preview' ?
                    <Button
                        variant={dateId ? 'primary' : 'disabled'}
                        title={t('publish_label')}
                        onClick={() => global.window.t721Sdk.events.start(token, {
                            event: dateResp.data.dates[0].parent_id,
                            dates: [dateId]
                        }).then(() => {
                            dispatch(PushNotification('Successfuly published !', 'success'));
                        }).catch(() => {
                            dispatch(PushNotification('Publish failed. Please try again later', 'error'));
                        })}
                    /> :
                    null
            }

            <Button
                variant={dateId ? 'secondary' : 'disabled'}
                title={t('preview_label')}
                onClick={() => history.push(`/group/${groupId}/date/${dateId}`)}
            />
        </Container>
    )
};

const Container = styled.div`
    margin: 0 ${props => props.theme.biggerSpacing};

    & > button {
        margin: 0 0 ${props => props.theme.smallSpacing};
        width: 100%;
    }
`;
