import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';
import './locales';
import { useParams } from 'react-router';
import { eventParam } from '../../screens/types';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FullPageLoading } from '@frontend/flib-react/lib/components';

export const PreviewBanner: React.FC = () => {
    const [ t ] = useTranslation('preview_banner');

    const token = useToken();
    const [fetchEventUuid] = useState(v4() + '@event-fetch');
    const { eventId } = useParams<eventParam>();

    const { response: eventResp } = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                id: {
                    $eq: eventId
                },
            }
        ],
        refreshRate: 50
    }, fetchEventUuid);

    if (eventResp.loading) {
        return <FullPageLoading/>;
    }

    if (eventResp.error || eventResp.data.events[0].status === 'live') {
        return <></>;
    }

    return <PreviewBannerContainer>
        {t('preview_banner_msg_1')}
        <strong>{t('preview_mode')}</strong>
        {t('preview_banner_msg_2')}
        <strong>{t('btn_name')}</strong>
        {t('preview_banner_msg_3')}
    </PreviewBannerContainer>;
};

const PreviewBannerContainer = styled.span`
    width: calc(100% - 350px);
    background-color: ${props => props.theme.primaryColorGradientEnd.hex};
    padding: ${props => props.theme.regularSpacing};
    top: 80px;
    left: 350px;
    z-index: 2;
    position: fixed;
    text-align: center;
`;