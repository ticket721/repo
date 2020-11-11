import React                                                                                  from 'react';
import { DateTimeCard, EventHeader, LocationCard, PhotosVideosCard, ReadMore, CardContainer } from '@frontend/flib-react/lib/components';
import Border
                                                                                              from '@frontend/flib-react/lib/components/elements/border';
import styled                                                                                 from 'styled-components';
import { DateEntity }                                                                         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatDay, formatHour }                                                              from '@frontend/core/lib/utils/date';
import { useTranslation }                                                                     from 'react-i18next';
import { useHistory }                                                                         from 'react-router';
import { getImgPath }                                                                         from '@frontend/core/lib/utils/images';
import { OnlineTag }                                                                          from '@frontend/flib-react/lib/components/events/single-image/OnlineTag';
import { isNil }                                                                              from 'lodash';
import {motion} from 'framer';
import spotifyImg                                                                             from '../../../media/images/social/spotify.svg';
import instagramImg                                                                             from '../../../media/images/social/instagram.svg';
import tiktokImg                                                                             from '../../../media/images/social/tiktok.svg';
import linked_inImg                                                                             from '../../../media/images/social/linkedIn.svg';
import emailImg                                                                             from '../../../media/images/social/email.svg';
import facebookImg                                                                             from '../../../media/images/social/facebook.svg';
import websiteImg                                                                             from '../../../media/images/social/website.svg';
import twitterImg                                                                             from '../../../media/images/social/twitter.svg';

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

const hasLinks = (date: DateEntity): boolean => {
    return (
        !isNil(date.metadata.spotify)
        || !isNil(date.metadata.instagram)
        || !isNil(date.metadata.tiktok)
        || !isNil(date.metadata.linked_in)
        || !isNil(date.metadata.email)
        || !isNil(date.metadata.facebook)
        || !isNil(date.metadata.website)
        || !isNil(date.metadata.twitter)
    );
};

const SocialIcon = styled(motion.img)`
  width: 40px;
  height: 40px;
  margin-left: ${props => props.theme.regularSpacing};
  margin-top: ${props => props.theme.regularSpacing};
  cursor: pointer;
`

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
                null}
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
            {
                hasLinks(props.date)

                    ?
                    <>
                        <CardContainer>
                            <div className={'row aic jcsb'}>
                                <h3>{t('links')}</h3>
                            </div>
                            <div
                                style={{
                                    marginTop: 8
                                }}
                            >
                                {
                                    props.date.metadata.spotify
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={spotifyImg}
                                            onClick={
                                                () => {
                                                    window.location.href = props.date.metadata.spotify;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.instagram
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={instagramImg}
                                            onClick={
                                                () => {
                                                    window.location.href = `https://instagram.com/${props.date.metadata.instagram}`;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.tiktok
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={tiktokImg}
                                            onClick={
                                                () => {
                                                    window.location.href = `https://tiktok.com/@${props.date.metadata.tiktok}`;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.linked_in
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={linked_inImg}
                                            onClick={
                                                () => {
                                                    window.location.href = props.date.metadata.linked_in;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.email
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={emailImg}
                                            onClick={
                                                () => {
                                                    window.location.href = `mailto:${props.date.metadata.email}`;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.facebook
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={facebookImg}
                                            onClick={
                                                () => {
                                                    window.location.href = props.date.metadata.facebook;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.website
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={websiteImg}
                                            onClick={
                                                () => {
                                                    window.location.href = props.date.metadata.website;
                                                }
                                            }
                                        />
                                        : null
                                }
                                {
                                    props.date.metadata.twitter
                                        ? <SocialIcon
                                            whileTap={{scale: 0.8}}
                                            src={twitterImg}
                                            onClick={
                                                () => {
                                                    window.location.href = `https://twitter.com/${props.date.metadata.website}`;
                                                }
                                            }
                                        />
                                        : null
                                }
                            </div>
                        </CardContainer>
                        <Border/>
                    </>

                    :
                    null
            }
            <PhotosVideosCard title={t('photos_videos_title')} photos={eventDetails.photos} removeBg showMore={false}/>
        </BgContainer>
    </Container>;

};
