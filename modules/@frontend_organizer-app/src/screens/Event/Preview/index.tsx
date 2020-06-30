import React, { useState }             from 'react';
import styled                          from 'styled-components';
import { useTranslation }              from 'react-i18next';
import { useParams }                   from 'react-router';
import { v4 }                          from 'uuid';
import { useSelector }                 from 'react-redux';

import {
    Gradient,
    EventHeader,
    DateTimeCard,
    LocationCard,
    ReadMore,
    EventCta,
}                                      from '@frontend/flib-react/lib/components';
import TagsListCard                    from '@frontend/flib-react/lib/components/cards/tags-list';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import {
    checkFormatDate,
    displayDate,
    displayTime
}                                      from '@frontend/core/lib/utils/date';
import { getImgPath }                  from '@frontend/core/lib/utils/images';

import { MergedAppState }              from '../../../index';
import { getPriceRange }               from '../../../utils/functions';

import './locales';

interface DatePreview {
    name: string;
    description: string;
    eventStart: Date;
    eventEnd: Date;
    cover: string;
    colors: string[];
    location: string;
    tags: string[];
    categoryName: string | null;
    prices: number[];
}

const formatDatePreview = (date: DateEntity): DatePreview => ({
    name: date.metadata.name,
    description: date.metadata.description,
    eventStart: date.timestamps.event_begin,
    eventEnd: date.timestamps.event_end,
    cover: getImgPath(date.metadata.avatar),
    colors: date.metadata.signature_colors,
    location: date.location.location_label,
    tags: date.metadata.tags,
    categoryName: null,
    prices: []
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
            refreshRate: 1,
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
            refreshRate: 1,
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
                prices: getPriceRange(categoryResp.data.categories),
            });
        }
    }, [categoryResp.data, datePreview]);

    let ticket;
    let priceRange;
    // tslint:disable-next-line
    const doNothing = () => {};

    if (datePreview && datePreview.name && categoryResp.data) {
        ticket = {
            name: datePreview.name,
            image: datePreview.cover,
            mainColor: datePreview.colors[0],
            location: datePreview.location,
            gradients: datePreview.colors,
            about: datePreview.description,
            startDate: displayDate(checkFormatDate(datePreview.eventStart)),
            endDate: displayDate(checkFormatDate(datePreview.eventEnd)),
            startTime: displayTime(checkFormatDate(datePreview.eventStart)),
            endTime: displayTime(checkFormatDate(datePreview.eventEnd)),
            tags: datePreview.tags.map(tag => ({ id: tag, label: tag })),
            resale: false
        };
        priceRange = datePreview.prices[1] !== null ?
          `${t('from')} ${datePreview.prices[0]}€ ${t('to')} ${datePreview.prices[1]}€ ${t('each')}`
          :
          `${datePreview.prices[0]}€ ${t('each')}`
        if (datePreview.prices[0] === null) {
            priceRange = t('unknown_prices')
        }
    }

    return (
        <>
            <TicketContainer>
                <Title>{t('title')}</Title>
                <Ticket>
                    {
                        ticket ?
                            <>
                                <Gradient values={datePreview.colors} blurOnly />
                                <EventHeader
                                    event={ticket}
                                    subtitle={priceRange}
                                    buttonTitle={t('get_tickets')}
                                    onChange={doNothing}
                                    onClick={doNothing}
                                />
                                <BgContainer>
                                    <DateTimeCard
                                        iconColor={ticket.mainColor}
                                        endDate={ticket.endDate}
                                        endTime={ticket.endTime}
                                        startDate={ticket.startDate}
                                        startTime={ticket.startTime}
                                        removeBg
                                    />
                                    <LocationCard
                                        address={''}
                                        iconColor={ticket.mainColor}
                                        location={ticket.location}
                                        removeBg
                                    />
                                    <Separator />
                                    <ReadMore
                                        readMoreColor={ticket.mainColor}
                                        title='About'
                                        text={ticket.about === '' ? t('no_description') : ticket.about}
                                        showLabel='Read more'
                                        hideLabel='Show less'
                                        removeBg
                                    />
                                    <Separator />
                                    <TagsListCard
                                        label={t('tags')}
                                        handleToggle={doNothing}
                                        showAll={true}
                                        tags={ticket.tags}
                                        hideLabel='Hide'
                                        removeBg
                                    />
                                    <Separator />
                                    <EventBottomBand
                                        ctaLabel={t('get_tickets')}
                                        title={t('tickets_from')}
                                        onClick={doNothing}
                                        subtitle={priceRange}
                                        gradients={ticket.gradients}
                                        show={true}
                                    />
                                </BgContainer>
                            </>
                          :
                          <span>Loading...</span>
                    }
                </Ticket>
            </TicketContainer>
        </>
    );
};

const TicketContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const Ticket = styled.div`
  width: 320px;
  height: 480px;
  margin-top: 20px;
  border-radius: 8px;
  overflow: scroll;
`;

const BgContainer = styled.div`
  background-color: ${ props => props.theme.darkerBg };
  margin-bottom:  ${ props => props.theme.biggerSpacing };
`;

const EventBottomBand = styled(EventCta)`
  position: inherit;
`;

const Title = styled.span`
  width: 100%;
  margin-bottom: 25px;
  font-weight: 500;
  font-size: 18px;
  color: ${(props) => props.theme.textColor};
  text-align: center;
`;

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;


export default Preview;
