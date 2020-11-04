import React, { useState } from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams } from 'react-router';
import { Button }  from '@frontend/flib-react/lib/components';

import { useTranslation }           from 'react-i18next';
import './locales';
import { useDispatch } from 'react-redux';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { v4 }                       from 'uuid';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { useToken } from '@frontend/core/lib/hooks/useToken';

export const DateActions: React.FC = () => {
    const [ t ] = useTranslation('date_actions');
    const history = useHistory();
    const dispatch = useDispatch();
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@date-actions');
    const { groupId, dateId } = useParams();

    const [ publishLoading, setPublishLoading ] = useState<boolean>(false);

    const { lazyRequest: publishEvent, response: publishResp } = useLazyRequest('events.start', uuid);

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
            refreshRate: 30,
        },
        uuid);

    useDeepEffect(() => {
        if (dateResp.data && dateResp.data.dates.length === 0) {
            history.push('/');
        }
    }, [dateResp.data]);

    useDeepEffect(() => {
        if (publishResp.error) {
            setPublishLoading(false);
            dispatch(PushNotification(t('publish_failed_notif'), 'error'));
        }
    }, [publishResp.error]);

    useDeepEffect(() => {
        if (publishResp.data) {
            setPublishLoading(false);
            dispatch(PushNotification(t('published_notif'), 'success'));
        }
    }, [publishResp.data]);

    return (
        <Container>
            {
                dateResp.data?.dates && dateResp.data?.dates?.[0]?.status === 'preview' ?
                    <Button
                        variant={dateId ? 'primary' : 'disabled'}
                        title={t('publish_label')}
                        loadingState={publishLoading}
                        onClick={() => {
                            setPublishLoading(true);
                            publishEvent([
                                token,
                                {
                                    event: dateResp.data.dates[0].parent_id,
                                    dates: [dateId],
                                }
                            ], {
                                force: true
                            })
                        }}
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
