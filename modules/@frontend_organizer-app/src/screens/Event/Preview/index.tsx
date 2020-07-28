import React, { useState } from 'react';
import styled                         from 'styled-components';
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
    LeafletMap,
    Icon,
    FullPageLoading,
} from '@frontend/flib-react/lib/components';
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

import { MergedAppState } from '../../../index';
import { getPriceRange }  from '../../../utils/functions';

import './locales';

interface DatePreview {
    name: string;
    about: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    image: string;
    mainColor: string;
    gradients: string[];
    location: string;
    coord: { lon: number, lat: number };
    tags: { id: string, label: string }[];
    resale: boolean;
    status: 'preview' | 'live';
}

const formatDatePreview = (date: DateEntity): DatePreview => ({
    name: date.metadata.name,
    about: date.metadata.description,
    startDate: displayDate(checkFormatDate(date.timestamps.event_begin)),
    startTime: displayTime(checkFormatDate(date.timestamps.event_begin)),
    endDate: displayDate(checkFormatDate(date.timestamps.event_end)),
    endTime: displayTime(checkFormatDate(date.timestamps.event_end)),
    image: getImgPath(date.metadata.avatar),
    mainColor: date.metadata.signature_colors[0],
    gradients: date.metadata.signature_colors,
    location: date.location.location_label,
    coord: date.location.location,
    tags: date.metadata.tags.map(tag => ({ id: tag, label: tag })),
    resale: false,
    status: date.status,
});

const Preview: React.FC = () => {
    const [ t ] = useTranslation('preview_event');
    const { dateId } = useParams();
    const history = useHistory();
    const [uuid] = useState(v4() + '@event-preview');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const [ datePreview, setDatePreview ] = useState<DatePreview>(null);
    const [ priceRange, setPriceRange ] = useState<number[]>([]);
    const [ hideBanner, setHideBanner ] = useState<boolean>(false);

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
            if (dateResp.data.dates.filter(d => d.parent_type === 'event').length === 0) {
                history.push('/');
            } else {
                setDatePreview(formatDatePreview(
                    dateResp.data.dates.filter(d => d.parent_type === 'event')?.[0],
                ));
            }
        }
    }, [dateResp.data]);

    useDeepEffect(() => {
        if (categoryResp.data?.categories?.length > 0) {
            setPriceRange(getPriceRange(categoryResp.data.categories));
        }
    }, [categoryResp.data]);

    return (
        <>
            {
                datePreview?.status === 'preview' && !hideBanner ?
                    <DraftBanner>
                        <Close onClick={() => setHideBanner(true)}>
                            <Icon icon={'close'} size={'10px'} color={'#FFF'}/>
                        </Close>
                        <DraftTitle>{t('draft_title')}</DraftTitle>
                        <DraftDesc>{t('draft_desc')}</DraftDesc>
                    </DraftBanner> :
                    null
            }
            <Container banner={datePreview?.status === 'preview' && !hideBanner}>
                <Title>{t('title')}</Title>
                <PreviewContainer>
                    {
                        datePreview ?
                        <div className='smartphone'>
                              <div className='content'>
                                    <Gradient values={datePreview.gradients} blurOnly />
                                    <EventHeader
                                        event={{...datePreview}}
                                        subtitle={
                                            priceRange[0] ? priceRange[1] ?
                                            `${t('from')} ${priceRange[0]}€ ${t('to')} ${priceRange[1]}€ ${t('each')}` :
                                            `${priceRange[0]}€ ${t('each')}` :
                                            t('free_ticket')
                                        }
                                        buttonTitle={t('get_tickets')}
                                        onChange={() => console.log}
                                        onClick={() => console.log}
                                    />
                                    <>
                                        <DateTimeCard
                                            iconColor={datePreview.mainColor}
                                            dates={[{
                                                startDate: datePreview.startDate,
                                                endDate: datePreview.endDate,
                                                startTime: datePreview.startTime,
                                                endTime: datePreview.endTime,
                                            }]}
                                            removeBg
                                        />
                                        <LocationCard
                                            address={''}
                                            iconColor={datePreview.mainColor}
                                            location={datePreview.location}
                                            removeBg
                                            subtitle={t('')}/>
                                        <LeafletMap
                                          width={'100%'}
                                          height={'300px'}
                                          coords={datePreview.coord}/>
                                        <Separator />
                                        <ReadMore
                                            readMoreColor={datePreview.mainColor}
                                            title='About'
                                            text={datePreview.about === '' ? t('no_description') : datePreview.about}
                                            showLabel='Read more'
                                            hideLabel='Show less'
                                            removeBg
                                        />
                                        <Separator />
                                        <TagsListCard
                                            label={t('tags')}
                                            handleToggle={() => console.log}
                                            showAll={true}
                                            tags={datePreview.tags}
                                            hideLabel='Hide'
                                            removeBg
                                        />
                                        <Separator />
                                        <EventBottomBand
                                            ctaLabel={t('get_tickets')}
                                            title={t('tickets_from')}
                                            onClick={() => console.log}
                                            subtitle={
                                                priceRange[0] ? priceRange[1] ?
                                                `${t('from')} ${priceRange[0]}€ ${t('to')} ${priceRange[1]}€ ${t('each')}` :
                                                `${priceRange[0]}€ ${t('each')}` :
                                                t('free_ticket')
                                            }
                                            gradients={datePreview.gradients}
                                            show={true}
                                        />
                                    </>
                                </div>
                            </div>
                          :
                          <FullPageLoading/>
                    }
                </PreviewContainer>
            </Container>
        </>
    );
};

const Container = styled.div<{ banner: boolean }>`
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: ${props => props.banner ? '70px' : '0'};
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
`;

const PreviewContainer = styled.div`
  .smartphone {
      position: relative;
      width: 352px;
      height: 630px;
      margin: auto;
      border: 16px #282531 solid;
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
      background: #aaa;
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
      background: #aaa;
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


const DraftBanner = styled.div`
    position: fixed;
    top: 80px;
    right: 0;
    z-index: 1100;
    width: calc(100vw - 280px);
    overflow: hidden;
    padding: ${props => props.theme.regularSpacing};
    background-color: ${props => props.theme.primaryColorGradientEnd.hex};
`;

const Close = styled.div`
    position: absolute;
    top: ${props => props.theme.smallSpacing};
    right: ${props => props.theme.smallSpacing};
    cursor: pointer;
`;

const DraftTitle = styled.span`
    display: flex;
    align-items: center;
    font-size: 14px;
    margin-bottom: 10px;
    font-weight: 500;
`;

const DraftDesc = styled.div`
    padding: 0 18px;
    font-size: 12px;
    line-height: ${props => props.theme.regularSpacing};
`;

export default Preview;
