import React                                                                   from 'react';
import { CardContainer, DateTimeCard, Description, EventHeader, LocationCard } from '@frontend/flib-react/lib/components';
import styled                                                                  from 'styled-components';
import { DateEntity }                                                          from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatDay, formatHour }                                               from '@frontend/core/lib/utils/date';
import { useTranslation }                                                      from 'react-i18next';
import { useHistory }                                                          from 'react-router';
import { getImgPath }                                                          from '@frontend/core/lib/utils/images';
import { motion }                                                              from 'framer';
import spotifyImg                         from '../../../media/images/social/spotify.svg';
import instagramImg                       from '../../../media/images/social/instagram.svg';
import tiktokImg                          from '../../../media/images/social/tiktok.svg';
import linked_inImg                       from '../../../media/images/social/linkedIn.svg';
import emailImg                           from '../../../media/images/social/email.svg';
import facebookImg                        from '../../../media/images/social/facebook.svg';
import websiteImg                         from '../../../media/images/social/website.svg';
import twitterImg                         from '../../../media/images/social/twitter.svg';
import shareImg                         from '../../../media/images/social/share.svg';
import likedOnImg                         from '../../../media/images/social/like_on.svg';
import likedOffImg                         from '../../../media/images/social/like_off.svg';
import { useWindowDimensions }            from '@frontend/core/lib/hooks/useWindowDimensions';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';
import { Plugins, Capacitor }             from '@capacitor/core';
import { useDispatch }                    from 'react-redux';
import { PushNotification }               from '@frontend/core/lib/redux/ducks/notifications';
import { getEnv }                         from '@frontend/core/lib/utils/getEnv';
import { useSavedEvents }                 from '../../../hooks/useSavedEvents';
const { Share } = Plugins;

export interface EventContainerProps {
    eventName: string;
    date: DateEntity;
    setCtaVisibility: (val: boolean) => void;
    priceString: string;
}


const BlurredBg = styled.div<{ cover: string }>`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
    overflow: hidden;

    > div {
        width: 100vw;
        padding-top: 60vh;
        filter: blur(2vw);
        background: url(${props => props.cover});
        background-size: 150%;
        background-position: center;
    }
`;

const Container = styled.div`
    width: 100vw;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    z-index: 2;
    overflow: hidden;

    @media screen and (min-width: 901px) {
        width: 900px;
        margin-top: calc(2 * ${props => props.theme.biggerSpacing});
    }
`;

const BgContainer = styled.div`
    position: relative;
    background-color: ${props => props.theme.darkerBg};
`;

const OverallInfos = styled.div`
    display: flex;
    flex-direction: row-reverse;

    @media screen and (max-width: 900px) {
        flex-direction: column;
    }
`;

const MainInfos = styled.div`
    display: flex;
    flex-direction: column;
    flex: 2;
    padding: ${props => props.theme.smallSpacing} ${props => props.theme.doubleSpacing};
    padding-bottom: ${props => props.theme.doubleSpacing};
    background-color: ${props => props.theme.darkBg};
    border-radius: ${props => props.theme.defaultRadius};

    @media screen and (max-width: 900px) {
        border-radius: 0;
        padding-bottom: 0;
        padding: 0;
    }
`;

const DescContainer = styled.div`
    flex: 3;
    padding: ${props => props.theme.smallSpacing};
    background-color: ${props => props.theme.darkerBg};
`;

const SocialIcon = styled(motion.img)`
  width: 40px;
  height: 40px;
  margin: ${props => props.theme.smallSpacing};
  cursor: pointer;
`

function copyToClipboard(text, dispatch, msg) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    dispatch(PushNotification(msg, 'info'));
}

export const EventContainer: React.FC<EventContainerProps> = (props: EventContainerProps): JSX.Element => {

    const imageUrl = getImgPath(props.date.metadata.avatar);
    const [t] = useTranslation('event');
    const history = useHistory();
    const dispatch = useDispatch();
    const windowDim = useWindowDimensions();
    const haptics = useHaptics();
    const [,addSavedEvent, removeSavedEvent, isSavedEvent] = useSavedEvents();

    const eventDetails = {
        eventName: props.eventName,
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

    return <>
        <BlurredBg cover={eventDetails.image}><div/></BlurredBg>
        <Container>
            <EventHeader
                preName={eventDetails.eventName}
                name={eventDetails.name}
                prices={props.priceString}
                cover={eventDetails.image}
                colors={eventDetails.gradients}
                online={props.date.online ? t('online') : undefined}
                buttonTitle={t('get_tickets')}
                onChange={props.setCtaVisibility}
                onClick={() => {
                    haptics.impact({
                        style: HapticsImpactStyle.Light
                    })
                    goToTicketSelection()
                }}
            />
            <BgContainer>
                <>
                    <CardContainer>
                        <div>
                            <SocialIcon
                                whileTap={{scale: 0.8}}
                                src={shareImg}
                                onClick={
                                    () => {
                                        haptics.impact({
                                            style: HapticsImpactStyle.Light
                                        })
                                        if (!Capacitor.isPluginAvailable('Share')) {
                                            copyToClipboard(`${getEnv().REACT_APP_SELF}/event/${props.date.id}`, dispatch, t('copied'))
                                        } else {
                                            Share
                                                .share({
                                                    title: `${t('share_title')} ${props.date.metadata.name}`,
                                                    url: `${getEnv().REACT_APP_SELF}/event/${props.date.id}`,
                                                    dialogTitle: `${t('share_dialog')} ${props.date.metadata.name}`
                                                })
                                                .catch(e => {
                                                    console.error(e);
                                                    copyToClipboard(`${getEnv().REACT_APP_SELF}/event/${props.date.id}`, dispatch, t('copied'));
                                                })
                                        }
                                    }
                                }
                            />
                            <SocialIcon
                                whileTap={{scale: 0.8}}
                                src={isSavedEvent(props.date.id.toLowerCase()) ? likedOnImg : likedOffImg}
                                onClick={
                                    () => {
                                        haptics.impact({
                                            style: HapticsImpactStyle.Light
                                        })
                                        if (isSavedEvent(props.date.id.toLowerCase())) {
                                            removeSavedEvent(props.date.id.toLowerCase());
                                        } else {
                                            addSavedEvent(props.date.id.toLowerCase());
                                        }
                                    }
                                }
                            />
                            {
                                props.date.metadata.spotify
                                    ? <SocialIcon
                                        whileTap={{scale: 0.8}}
                                        src={spotifyImg}
                                        onClick={
                                            () => {
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
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
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
                                                window.location.href = `https://twitter.com/${props.date.metadata.twitter}`;
                                            }
                                        }
                                    />
                                    : null
                            }
                        </div>
                    </CardContainer>
                </>
                <OverallInfos>
                    <MainInfos>
                        <DateTimeCard
                            iconColor={eventDetails.mainColor}
                            dates={[{
                                startDate: eventDetails.startDate,
                                endDate: eventDetails.endDate,
                                startTime: eventDetails.startTime,
                                endTime: eventDetails.endTime,
                            }]}
                            paddingOverride={windowDim.width > 900 ? '24px 0' : '24px'}
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
                                    paddingOverride={windowDim.width > 900 ? '24px 0' : '24px'}
                                    removeBg
                                    coords={
                                        props.date.location.location
                                    }
                                />
                        }
                    </MainInfos>
                    <DescContainer>
                        <Description
                            color={eventDetails.mainColor}
                            title={t('description_title')}
                            text={eventDetails.about}
                            removeBg
                        />
                    </DescContainer>
                </OverallInfos>
            </BgContainer>
        </Container></>;

};
