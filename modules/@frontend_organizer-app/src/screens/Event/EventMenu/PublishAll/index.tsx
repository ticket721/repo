import React, { useState } from 'react';
import styled                         from 'styled-components';

import { useParams } from 'react-router';
import { Button }  from '@frontend/flib-react/lib/components';

import { useTranslation }           from 'react-i18next';
import './locales';
import { useDispatch } from 'react-redux';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { v4 }                       from 'uuid';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';

export const PublishAll: React.FC = () => {
    const [ t ] = useTranslation('publish_all');
    const dispatch = useDispatch();
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@publish-all');
    const { groupId } = useParams();

    const [ publishLoading, setPublishLoading ] = useState<boolean>(false);

    const { lazyRequest: publishEvent, response: publishResp } = useLazyRequest('events.start', uuid);

    const { response: notPublishedResp } = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId
                    },
                    status: {
                        $eq: 'preview'
                    },
                    parent_type: {
                        $eq: 'event'
                    },
                }
            ],
            refreshRate: 30,
        },
        uuid);

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
        <>
            {
                notPublishedResp.data?.dates.length > 0 ?
                    <Container>
                        <Button
                            variant={'primary'}
                            title={t('publish_all_label')}
                            loadingState={publishLoading}
                            onClick={() => {
                                setPublishLoading(true);
                                publishEvent([
                                    token,
                                    {
                                        event: notPublishedResp.data.dates[0].parent_id,
                                        dates: notPublishedResp.data.dates.map((date) => date.id),
                                    }
                                ], {
                                    force: true
                                })
                            }}
                        />
                    </Container>
                    :
                    null
            }
        </>
    )
};

const Container = styled.div`
    margin: 0 ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
`;
