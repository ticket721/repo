import React                                                                   from 'react';
import { DateTimeCard, EventHeader, LocationCard, PhotosVideosCard, ReadMore } from '@frontend/flib-react/lib/components';
import Border                                                                  from '@frontend/flib-react/lib/components/elements/border';
import styled                                                                  from 'styled-components';
import { DateEntity }                                                          from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatDay, formatHour }                                               from '@frontend/core/lib/utils/date';
import { useTranslation }                                                      from 'react-i18next';
import { useHistory }                                                          from 'react-router';
import { getImgPath }                                                          from '@frontend/core/lib/utils/images';
import { OnlineTag }                                                           from '@frontend/flib-react/lib/components/events/single-image/OnlineTag';

export interface EventContainerProps {
    date: DateEntity;
    setCtaVisibility: (val: boolean) => void;
    priceString: string;
}

const Container = styled.div`
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
`;

const BgContainer = styled.div`
    background-color: #1b1726;
`;

const OnlineTagContainer = styled.div`
  position: fixed;
  top: calc(14px + env(safe-area-inset-top));
  top: calc(14px + constant(safe-area-inset-top));
  right: 14px;
  z-index: 9999;
`;

export const EventContainer: React.FC<EventContainerProps> = (props: EventContainerProps): JSX.Element => {

    const imageUrl = getImgPath(props.date.metadata.avatar);
    const [t] = useTranslation('event');
    const history = useHistory();

    const eventDetails = {
        name: props.date.metadata.name,
        location: props.date.location?.location_label,
        startDate: formatDay(new Date(props.date.timestamps.event_begin)),
        endDate: formatDay(new Date(props.date.timestamps.event_end)),
        startTime: formatHour(new Date(props.date.timestamps.event_begin)),
        endTime: formatHour(new Date(props.date.timestamps.event_end)),
        about: props.date.metadata.description,
        resale: true,
        gradients: props.date.metadata.signature_colors,
        mainColor: props.date.metadata.signature_colors[0],
        image: imageUrl,
        photos: [imageUrl],
    };

    const goToTicketSelection = () => {
        history.push(`/event/${props.date.id}/selection`);
    };

    return <Container>
        {
            props.date.online

                ?
                <OnlineTagContainer>
                    <OnlineTag
                        online={t('online')}
                    />
                </OnlineTagContainer>

                :
                null
        }
        <EventHeader
            event={eventDetails}
            subtitle={props.priceString}
            buttonTitle={t('get_tickets')}
            onChange={props.setCtaVisibility}
            onClick={goToTicketSelection}
        />
        <BgContainer>
            <ReadMore
                readMoreColor={eventDetails.mainColor}
                title={t('read_more_title')}
                text={eventDetails.about}
                showLabel={t('read_more_show_more')}
                hideLabel={t('read_more_show_less')}
                removeBg
            />
            <Border/>
            <DateTimeCard
                iconColor={eventDetails.mainColor}
                dates={[{
                    startDate: eventDetails.startDate,
                    endDate: eventDetails.endDate,
                    startTime: eventDetails.startTime,
                    endTime: eventDetails.endTime,
                }]}
                removeBg
            />
            {
                props.date.online

                    ?
                    null

                    :
                    <LocationCard
                        iconColor={eventDetails.mainColor}
                        location={eventDetails.location}
                        subtitle={t('get_directions')}
                        removeBg
                        coords={
                            props.date.location.location
                        }
                    />
            }
            <Border/>
            <PhotosVideosCard title={t('photos_videos_title')} photos={eventDetails.photos} removeBg showMore={false}/>
        </BgContainer>
    </Container>;

};
