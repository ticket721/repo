import React, { useState } from 'react';
import styled                         from 'styled-components';
import { PreviewInfos, TicketHeader }  from '@frontend/flib-react/lib/components';
import { useParams }                   from 'react-router';
import { v4 }                          from 'uuid';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                 from 'react-redux';
import { MergedAppState }              from '../../../index';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { DateEntity }                                                     from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { checkFormatDate, displayDate, displayTime } from '@frontend/core/lib/utils/date';

import { useTranslation } from 'react-i18next';
import './locales';
import { getImgPath }     from '@frontend/core/lib/utils/images';

interface DatePreview {
    name: string;
    eventStart: Date;
    eventEnd: Date;
    cover: string;
    colors: string[];
    location: string;
    categoryName: string;
}

const formatDatePreview = (date: DateEntity): DatePreview => ({
    name: date.metadata.name,
    eventStart: date.timestamps.event_begin,
    eventEnd: date.timestamps.event_end,
    cover: getImgPath(date.metadata.avatar),
    colors: date.metadata.signature_colors,
    location: date.location.location_label,
    categoryName: null,
});

const Preview: React.FC = () => {
    const [ t ] = useTranslation('preview_event');
    const { dateId } = useParams();
    const [uuid] = useState(v4() + '@event-preview');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const [ datePreview, setDatePreview ] = useState<DatePreview>(null);
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
            refreshRate: 5,
        },
        uuid
    );

    const { response: categoryResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    parent_id: {
                        $eq: dateId,
                    },
                    $page_size: 1,
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    useDeepEffect(() => {
        if (dateResp.data) {
            setDatePreview(formatDatePreview(dateResp.data.dates[0]));
        }
    }, [dateResp.data]);

    useDeepEffect(() => {
        if (categoryResp.data && datePreview?.name) {
            setDatePreview({
                ...datePreview,
                categoryName: categoryResp.data.categories[0]?.display_name,
            });
        }
    }, [categoryResp.data, datePreview]);

    return (
        <PreviewContainer>
            <Title>{t('title')}</Title>
            <TicketContainer>
                <Ticket>
                    {
                        datePreview && datePreview.name ?
                            <>
                                <TicketHeader
                                    cover={datePreview.cover}/>
                                <Overlap>
                                    <PreviewInfos
                                        ticket={{
                                            name: datePreview.name,
                                            image: datePreview.cover,
                                            mainColor: datePreview.colors[0],
                                            location: datePreview.location,
                                            gradients: datePreview.colors,
                                            ticketType: datePreview.categoryName && 'Foo category',
                                            address: '',
                                            ticketId: '',
                                            startDate: displayDate(checkFormatDate(datePreview.eventStart)),
                                            endDate: displayDate(checkFormatDate(datePreview.eventEnd)),
                                            startTime: displayTime(checkFormatDate(datePreview.eventStart)),
                                            endTime: displayTime(checkFormatDate(datePreview.eventEnd)),
                                        }}
                                    />
                                </Overlap>
                            </> :
                            <span>Loading...</span>
                    }
                </Ticket>
            </TicketContainer>
        </PreviewContainer>
    );
};

const PreviewContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const TicketContainer = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
`;

const Ticket = styled.div`
    width: 380px;
    margin-top: 20px;
    border-radius: 8px;
    overflow: hidden;
`;

const Overlap = styled.div`
    margin-top: -94px;
    position: relative;
    z-index: 1;
`;

const Title = styled.span`
    width: 100%;
    margin-bottom: 25px;
    font-weight: 500;
    font-size: 18px;
    color: ${(props) => props.theme.textColor};
    text-align: center;
`;

export default Preview;
