import React, { useState }             from 'react';
import styled                          from 'styled-components';
import { useTranslation }              from 'react-i18next';
import { useParams, useHistory }       from 'react-router';
import { v4 }                          from 'uuid';
import { useSelector }                 from 'react-redux';

import {
    Gradient,
    EventHeader,
    DateTimeCard,
    LocationCard,
    ReadMore,
    EventCta,
    LeafletMap
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
    coord: { lon: number, lat: number };
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
    coord: date.location.location,
    tags: date.metadata.tags,
    categoryName: null,
    prices: []
});

const Preview: React.FC = () => {
    const [ t ] = useTranslation('preview_event');
    const { dateId } = useParams();
    const history = useHistory();
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
            if (dateResp.data.dates.filter(d => d.parent_type === 'event' || d.parent_type === 'date').length === 0) {
                history.push('/');
            } else {
                setDatePreview(formatDatePreview(dateResp.data.dates.filter(d => d.parent_type === 'event' || d.parent_type === 'date')?.[0]));
            }
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
        <Container>
            <Title>{t('title')}</Title>
            <PreviewContainer>
                {
                    ticket ?
                    <div className='smartphone'>
                          <div className='content'>
                                <Gradient values={datePreview.colors} blurOnly />
                                <EventHeader
                                    event={ticket}
                                    subtitle={priceRange}
                                    buttonTitle={t('get_tickets')}
                                    onChange={doNothing}
                                    onClick={doNothing}
                                />
                                <>
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
                                    <LeafletMap
                                      width={'100%'}
                                      height={'300px'}
                                      coords={datePreview.coord}/>
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
                                </>
                            </div>
                        </div>
                      :
                      <span>Loading...</span>
                }
            </PreviewContainer>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const PreviewContainer = styled.div`
  .smartphone {
      position: relative;
      width: 353px;
      height: 630px;
      margin: auto;
      border: 16px black solid;
      border-top-width: 60px;
      border-bottom-width: 60px;
      border-radius: 36px;
  }

/* The horizontal line on the top of the device */
  .smartphone:before {
      content: '';
      display: block;
      width: 60px;
      height: 5px;
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #333;
      border-radius: 10px;
  }

/* The circle on the bottom of the device */
  .smartphone:after {
      content: '';
      display: block;
      width: 35px;
      height: 35px;
      position: absolute;
      left: 50%;
      bottom: -65px;
      transform: translate(-50%, -50%);
      background: #333;
      border-radius: 50%;
  }

/* The screen (or content) of the device */
  .smartphone .content {
      width: 320px;
      height: 510px;
      background: inherit;
      overflow: scroll;
  }
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
