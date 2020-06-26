import React                                                                             from 'react';
import { DateTimeCard, EventHeader, LocationCard, PhotosVideosCard, ReadMore, TagsList } from '@frontend/flib-react/lib/components';
import Border                                                                            from '@frontend/flib-react/lib/components/elements/border';
import styled                                                                            from 'styled-components';
import { DateEntity }                                                                    from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatDay, formatHour }                                                         from '@frontend/core/lib/utils/date';
import { useTranslation }                                                                from 'react-i18next';
import { useHistory }                                                                    from 'react-router';

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
    margin-bottom: 90px;
`;

export const EventContainer: React.FC<EventContainerProps> = (props: EventContainerProps): JSX.Element => {

    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/${props.date.metadata.avatar}`;
    const [t] = useTranslation('event');
    const history = useHistory();

    const eventDetails = {
        name: props.date.metadata.name,
        location: props.date.location.location_label,
        startDate: formatDay(new Date(props.date.timestamps.event_begin)),
        endDate: formatDay(new Date(props.date.timestamps.event_end)),
        startTime: formatHour(new Date(props.date.timestamps.event_begin)),
        endTime: formatHour(new Date(props.date.timestamps.event_end)),
        about: props.date.metadata.description,
        tags: props.date.metadata.tags.map((tag: string, idx: number) => ({
            id: idx,
            label: tag
        })),
        resale: true,
        gradients: props.date.metadata.signature_colors,
        mainColor: props.date.metadata.signature_colors[0],
        image: imageUrl,
        photos: [imageUrl],
    };

    const goToTicketSelection = () => {
        history.push(`/event/${props.date.id}/selection`)
    };

    return <Container>
        <EventHeader
            event={eventDetails}
            subtitle={props.priceString}
            buttonTitle={t('get_tickets')}
            onChange={props.setCtaVisibility}
            onClick={goToTicketSelection}
        />
        <BgContainer>
            <DateTimeCard
                iconColor={eventDetails.mainColor}
                endDate={eventDetails.endDate}
                endTime={eventDetails.endTime}
                startDate={eventDetails.startDate}
                startTime={eventDetails.startTime}
                removeBg
            />
            <LocationCard
                iconColor={eventDetails.mainColor}
                location={eventDetails.location}
                removeBg
                coords={
                    props.date.location.location
                }
            />
            <Border/>
            <ReadMore
                readMoreColor={eventDetails.mainColor}
                title={t('read_more_title')}
                text={eventDetails.about}
                showLabel={t('read_more_show_more')}
                hideLabel={t('read_more_show_less')}
                removeBg
            />
            <Border/>
            <PhotosVideosCard title={t('photos_videos_title')} photos={eventDetails.photos} removeBg showMore={false}/>
            <Border/>
            <TagsList
                label={t('tags_title')}
                handleToggle={console.log}
                showAll={console.log}
                tags={eventDetails.tags}
                hideLabel={t('tags_hide')}
                removeBg
            />
        </BgContainer>
    </Container>

}
