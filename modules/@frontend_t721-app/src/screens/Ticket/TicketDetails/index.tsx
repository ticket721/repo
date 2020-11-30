import React, { useEffect, useMemo, useState } from 'react';
import {
    DateTimeCard,
    Gradient,
    Icon,
    LocationCard,
    OnlineCard,
    PurchaseInfosCard,
    TicketHeader,
    TicketInfosCard,
}                                              from '@frontend/flib-react/lib/components';
import {
    formatDay,
    formatHour,
}                                              from '@frontend/core/lib/utils/date';
import { useTranslation }                      from 'react-i18next';
import './locales';
import styled, { useTheme } from 'styled-components';
import { useHistory }       from 'react-router';
import { AnimatePresence, motion }             from 'framer';
import qrcodePreview                           from '../../../media/images/qrcodePreview.png';
import qrcodePreview2                          from '../../../media/images/qrcodePreview2.png';
import { getImgPath }                          from '@frontend/core/lib/utils/images';
import { useDispatch, useSelector }            from 'react-redux';
import { T721AppState }                        from '../../../redux';
import {
    ResetTicket,
    StartRegenInterval,
}                                              from '../../../redux/ducks/device_wallet';
import { DynamicQrCode }                       from '../DynamicQrCode';
import { CategoryEntity }                      from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }                        from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DateEntity }                          from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import { useInView }                           from 'react-intersection-observer';
import { useWindowDimensions }                 from '@frontend/core/lib/hooks/useWindowDimensions';
import { getPrice }                            from '../../../utils/prices';
import { PushNotification }                    from '@frontend/core/lib/redux/ducks/notifications';
import { OnlineBadge }                         from '@frontend/flib-react/lib/components/events/single-image/OnlineTag';
import { usePlatform }                                             from '@capacitor-community/react-hooks/platform';
import { DownloadAppModal }                                        from '../DownloadAppModal';
import { HapticsImpactStyle, HapticsNotificationType, useHaptics } from '@frontend/core/lib/utils/useHaptics';
import { Theme }                                                   from '@frontend/flib-react/lib/config/theme';
import Sticky from 'react-stickynode';
// tslint:disable-next-line:no-var-requires
const publicIp = require('public-ip');
// tslint:disable-next-line:no-var-requires
const safeAreaInsets = require('safe-area-insets');

interface TicketDetailsDateHeaderContainerProps {
    sticky: boolean;
}

const TicketDetailsDateHeaderContainer = styled.div<TicketDetailsDateHeaderContainerProps>`
  height: 80px;
  width: 100%;
  background-color: ${(props) => (props.theme.darkBg)};
  box-shadow: ${props => props.sticky ? '0 5px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' : '0 0 0 rgba(0,0,0,0.19), 0 0 0 rgba(0,0,0,0.23)'};
  border-top-left-radius: ${props => !props.sticky ? '12px' : '0px'};
  transition: all 1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.regularSpacing};
`;

interface DateIconProps {
    width: number;
    height: number;
    avatar: string;
    online: boolean;
}

const DateIconContainer = styled.div<DateIconProps>`
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: ${props => props.theme.defaultRadius};
  background-image: url(${props => props.avatar});
  background-size: cover;
  background-position: center;
`

const DateIcon = (props: DateIconProps) => {
    return <DateIconContainer
        width={props.width}
        height={props.height}
        avatar={props.avatar}
        online={props.online}
    >
        {
            props.online

                ?
                <div
                    style={{
                        position: 'absolute',
                        right: 3,
                        top: 3
                    }}
                >
                    <OnlineBadge/>
                </div>

                :
                null
        }
    </DateIconContainer>
}

const DateTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const DateSubtitle = styled.span`
  font-size: 14px;
  font-weight: 400;
  opacity: 0.5;
`;

const LinkChevron = styled(Icon)`
  transform: rotate(-90deg);
`;

const DAY = 1000 * 60 * 60 * 24;

const getRemainingTime = (date: Date, end: Date): [string, number] => {
    const now = Date.now();

    if (now > date.getTime() && now < end.getTime()) {
        return ['today', 0];
    }

    if (now > end.getTime()) {
        return ['ended', Math.ceil((end.getTime() - now) / DAY)];
    }

    return ['day_left', Math.floor((date.getTime() - now) / DAY)];

};

interface TicketDetailsDateHeaderProps {
    date: DateEntity;
    setFocused: (date: DateEntity) => void;
    isSticky: boolean;
}

const TicketDetailsDateHeader: React.FC<TicketDetailsDateHeaderProps> = (props: TicketDetailsDateHeaderProps): JSX.Element => {
    const [t] = useTranslation('ticket_details');
    const [isSticky, setIsSticky] = useState(false);
    const haptics = useHaptics();
    useEffect(() => {
        if (props.isSticky) {
            props.setFocused(props.date);

            if (!isSticky) {
                setIsSticky(true);
                haptics.impact({
                    style: HapticsImpactStyle.Light
                });
            }

        } else {
            if (isSticky) {
                setIsSticky(false);
            }
        }
        // eslint-disable-next-line
    }, [props.isSticky, props.date, props.setFocused]);
    const incoming = useMemo(() =>
            getRemainingTime(new Date(props.date.timestamps.event_begin), new Date(props.date.timestamps.event_end)),
        [props.date.timestamps.event_begin, props.date.timestamps.event_end]
    );

    return <>
        <TicketDetailsDateHeaderContainer
            sticky={props.isSticky}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <DateIcon
                    avatar={props.date.metadata.avatar}
                    width={60}
                    height={60}
                    online={props.date.online}
                />
                <div
                    style={{
                        padding: 8,
                        height: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                    }}
                >
                    <DateTitle>{props.date.metadata.name}</DateTitle>
                    <DateSubtitle>
                        {t(incoming[0], { count: Math.abs(incoming[1]), context: `${Math.abs(incoming[1])}` })}
                    </DateSubtitle>
                </div>
            </div>
            <LinkChevron icon={'chevron'} size={'10px'} color={'white'}/>
        </TicketDetailsDateHeaderContainer>
    </>
};

const distanceToStart = (date: DateEntity, now: number): number => {
    return Math.abs(now - new Date(date.timestamps.event_begin).getTime());
};

const dateSortFn = (date1: DateEntity, date2: DateEntity): number => {
    const now = Date.now();
    const distance = distanceToStart(date1, now) - distanceToStart(date2, now);
    if (distance === 0) {
        return new Date(date1.created_at).getTime() - new Date(date2.created_at).getTime();
    }
    return distance;
};

interface QRHoverContainerProps {
    spacing: number;
    navbar: number;
    width: number;
    height: number;
}

const QRHoverContainer = styled(motion.div) <QRHoverContainerProps>`
  left: ${props => props.spacing}px;
  bottom: calc(${props => props.spacing + props.navbar}px + env(safe-area-inset-bottom));
  bottom: calc(${props => props.spacing + props.navbar}px + constant(safe-area-inset-bottom));
  position: fixed;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: 100%;
  z-index: 99999;
  overflow: hidden;

  background-color: ${props => props.theme.textColor};

  display: flex;
  justify-content: center;
  align-items: center;
`;

const catchLiveTicket721Com = (onlineLink: string, ip: string, date: DateEntity): string => {
    const url = new URL(onlineLink);

    const type = url.searchParams.get('type');

    switch (type) {
        case 'vimeo': {
            const vimeoId = url.searchParams.get('vimeo_id');
            const chatId = url.searchParams.get('vimeo_chat_id');
            const payload = btoa(JSON.stringify({
                ip,
                urls: [{
                    url: `https://player.vimeo.com/video/${vimeoId}`,
                    landscape: {
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: '50%'
                    },
                    portrait: {
                        top: '0',
                        left: '0',
                        height: '50%',
                        width: '100%'
                    }
                }, {
                    url: `https://vimeo.com/live-chat/${vimeoId}${chatId ? '/' + chatId : ''}`,
                    landscape: {
                        top: '0',
                        left: '50%',
                        height: '100%',
                        width: '50%'
                    },
                    portrait: {
                        top: '50%',
                        left: '0',
                        height: '50%',
                        width: '100%'
                    }
                }]
            }));

            const destination = `https://live.ticket721.com?_=${payload}`;

            window.location.href = destination;

            return destination
        }
    }

    return null

}

const catchExceptions = (onlineLink: string, ip: string, date: DateEntity): string => {
    const url = new URL(onlineLink);

    switch (url.hostname) {
        case 'live.ticket721.com': {
            return catchLiveTicket721Com(onlineLink, ip, date);
        }
    }

    return null;
}

const onlineLinkWrapper = async (dispatch, t, onlineLink, date): Promise<void> => {
    publicIp
        .v4()
        .then(
            ip => {
                const caughtType = catchExceptions(onlineLink, ip, date);

                if (!caughtType) {
                    const payload = btoa(JSON.stringify({
                        ip,
                        url: onlineLink,
                    }));

                    window.location.href = `https://live.ticket721.com/?_=${payload}`;
                }

            },
        )
        .catch(
            () => {
                dispatch(PushNotification(t('ip_fetch_error'), 'error'));
            },
        );
};

const isPhysicalChecker = (dates: DateEntity[]): boolean => {
    return dates.filter((date: DateEntity) => date.online === false).length > 0;
};

const QRHoverButton = (props: {
    qrOpened: boolean;
    inView: boolean;
    qrPrev: any;
    onClick: () => void;
}): JSX.Element => {

    const window = useWindowDimensions();
    const width = useMemo(() => window.width < 900 ? 65 : 80, [window.width]);
    const height = useMemo(() => window.width < 900 ? 65 : 80, [window.width]);
    const navbar = useMemo(() => window.width < 900 ? 70 : 0, [window.width]);
    const spacing = useMemo(() => window.width >= 900 ? 32 : 8, [window.width]);
    const haptics = useHaptics();

    return <QRHoverContainer
        onClick={() => {

            haptics.notification({
                type: HapticsNotificationType.SUCCESS
            });
            props.onClick()
        }}
        whileTap={{
            scale: 0.95
        }}
        initial={'hidden'}
        animate={!props.inView && !props.qrOpened ? 'visible' : 'hidden'}
        variants={{
            visible: {
                left: spacing,
                rotate: 0,
                transition: {
                    duration: 0.5,
                    rotate: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 10,
                    },
                },
            },
            hidden: {
                left: -(window.width + spacing),
                rotate: 45,
                transition: {
                    duration: 0.5,
                    rotate: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 10,
                    },
                },
            },
        }}
        drag
        dragMomentum={true}
        dragConstraints={{
            // top: -amplitudeY,
            // left: -amplitudeX,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        }}

        width={width}
        height={height}
        navbar={navbar}
        spacing={spacing}
    >
        <img src={props.qrPrev} alt={'qrPreview'} style={{
            width: 35,
            height: 35,
        }}/>
    </QRHoverContainer>;
};

export interface TicketDetailsProps {
    ticket: TicketEntity;
    category: CategoryEntity;
    event: EventEntity;
    dates: DateEntity[]
}

export const TicketDetails: React.FC<TicketDetailsProps> = (props: TicketDetailsProps) => {
    const history = useHistory();
    const [t] = useTranslation('ticket_details');
    const seconds = useSelector((state: T721AppState) => state.deviceWallet.seconds);
    const dispatch = useDispatch();
    const [currentDate, setCurrentDate] = useState<DateEntity>(null);
    const theme = useTheme() as Theme;
    const [fixedStates, setFixedStates] = useState({})

    const { width } = useWindowDimensions();
    const [qrPrev, setQrPrev] = useState<string>(qrcodePreview);
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const haptics = useHaptics();

    const { platform } = usePlatform();

    const { ref, inView } = useInView();

    useEffect(() => {
        dispatch(StartRegenInterval(props.ticket.id));

        return () => dispatch(ResetTicket());
        // eslint-disable-next-line
    }, [props.ticket.id]);

    useEffect(() => {
        if (seconds === 0) {
            setQrPrev(qrPrev === qrcodePreview ? qrcodePreview2 : qrcodePreview);
        }
        // eslint-disable-next-line
    }, [seconds]);

    useEffect(() => {
        if (inView) {
            setCurrentDate(null);
        }
    }, [inView]);

    const isPhysical = useMemo(() => isPhysicalChecker(props.dates), [props.dates]);

    return <Container>
        {
            isPhysical
            && (platform === 'ios' || platform === 'android')
                ?
                <QRHoverButton
                    inView={inView}
                    qrOpened={modalOpened}
                    onClick={() => setModalOpened(true)}
                    qrPrev={qrPrev}
                />

                :
                null
        }
        <TicketHeader fullWidth cover={getImgPath(props.event.avatar)} datesCount={1} datesIdx={0} mainColors={['#ffffff', '#000000']}/>
        <TicketContent>
            <Gradient values={currentDate ? currentDate.metadata.signature_colors : props.event.signature_colors}/>
            <Details>
                <TicketInfosCard
                    eventName={props.event.name}
                    ticketType={props.category.display_name}
                    ticketID={props.ticket.id}
                    colors={props.event.signature_colors}
                />
                {
                    isPhysical

                        ?
                        <Banner>
                            <QrLink>
                                <Btn
                                    onClick={() => {
                                        haptics.notification({
                                            type: HapticsNotificationType.SUCCESS
                                        });
                                        setModalOpened(true)
                                    }}
                                    ref={ref}
                                    whileTap={{
                                        scale: 0.95
                                    }}
                                >
                                    <img src={qrPrev} alt={'qrPreview'}/>
                                    <Timer>
                                        <span>{t('next_gen_label')}</span>
                                        <span>{seconds}</span>
                                    </Timer>
                                    <span
                                        style={{
                                            fontWeight: 500,
                                        }}
                                    >
                                Dynamic Ticket
                            </span>
                                </Btn>
                            </QrLink>
                        </Banner>

                        :
                        null
                }
                <PurchaseInfosCard
                    purchasedLabel={t('purchased_date')}
                    priceLabel={t('price')}
                    date={formatDay(props.ticket.created_at)}
                    iconColor={props.event.signature_colors[0]}
                    price={getPrice(props.category, t('free'))}
                    wBottomLeftRadius={true}
                />
                {
                    props.dates
                        .sort(dateSortFn)
                        .map((date, idx, dates) => (
                            <div
                                key={date.id}
                            >
                                <div
                                    style={{
                                        position: 'relative',
                                        height: 4,
                                        width: 'calc(100%)',
                                        backgroundColor: 'transparent',
                                        zIndex: 1001
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            height: 4,
                                            width: '8px',
                                            left: '100%',
                                            top: 0,
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            zIndex: 1001
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        overflow: 'hidden',
                                        borderBottomLeftRadius: idx < dates.length - 1 ? '12px' : theme.defaultRadius
                                    }}
                                >
                                    <Sticky
                                        enabled={true}
                                        top={width <= 900 ? 48 + safeAreaInsets.top : 0}
                                        bottomBoundary={`#content-${date.id}`}
                                        innerZ={1001}
                                        onStateChange={({status}) => {
                                            setFixedStates({
                                                ...fixedStates,
                                                [date.id]: status > 0
                                            })
                                        }}
                                    >
                                        <div
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                haptics.impact({
                                                    style: HapticsImpactStyle.Light
                                                })
                                                if (date.status === 'live') {
                                                    history.push(`/event/${date.id}`)
                                                } else {
                                                    dispatch(PushNotification(t('event_unpublished'), 'warning'));
                                                }
                                            }}
                                        >
                                            <TicketDetailsDateHeader
                                                date={date}
                                                setFocused={setCurrentDate}
                                                isSticky={!!fixedStates[date.id]}
                                            />
                                        </div>
                                    </Sticky>
                                    <div
                                        id={`content-${date.id}`}
                                    >

                                        <DateTimeCard
                                            dates={[{
                                                id: date.id,
                                                name: date.metadata.name,
                                                startDate: formatDay(date.timestamps.event_begin),
                                                endDate: formatDay(date.timestamps.event_end),
                                                startTime: formatHour(date.timestamps.event_begin),
                                                endTime: formatHour(date.timestamps.event_end),
                                                location: date.location?.location_label,
                                            }]}
                                            iconColor={date.metadata.signature_colors[0]}
                                            label={t('show_all_dates_label')}
                                            labelCollapse={t('collapse_dates_label')}
                                            onClick={(dateId: string) => history.push('/event/' + dateId)}
                                        />
                                        {
                                            date.online

                                                ?
                                                <OnlineCard
                                                    online={true}
                                                    start={new Date(date.timestamps.event_begin)}
                                                    end={new Date(date.timestamps.event_end)}
                                                    onClick={() => {
                                                        haptics.notification({
                                                            type: HapticsNotificationType.SUCCESS
                                                        });
                                                        onlineLinkWrapper(dispatch, t, date.online_link, date);
                                                    }
                                                    }
                                                    online_link={date.online_link}
                                                    live_title={t('live_title')}
                                                    offline_title={t('offline_title')}
                                                    waiting_link_subtitle={t('waiting_link_subtitle')}
                                                    ended_subtitle={t('ended_subtitle')}
                                                    live_subtitle={t('live_subtitle')}
                                                    soon_subtitle={t('soon_subtitle')}
                                                />
                                                :
                                                <LocationCard
                                                    location={date.location.location_label}
                                                    coords={date.location.location}
                                                    iconColor={date.metadata.signature_colors[0]}
                                                    get_directions={t('get_directions')}
                                                    subtitle={t('get_directions')}
                                                    ticketFormat={true}
                                                    bottomLeftRadius={idx < dates.length - 1 ? '12px' : theme.defaultRadius}
                                                />
                                        }
                                    </div>
                                </div>
                            </div>
                        ))
                }
            </Details>
        </TicketContent>
        <AnimatePresence>
            {
                modalOpened ?
                    platform === 'ios' || platform === 'android' ?
                        <DynamicQrCode
                            name={props.event.name}
                            category={props.category.display_name}
                            color={props.event.signature_colors[0]}
                            onClose={() => setModalOpened(false)}/> :
                        <DownloadAppModal closeModal={() => setModalOpened(false)}/> :
                    null
            }
        </AnimatePresence>
    </Container>;
};

const Container = styled.div`
    width: 100%;

    @media screen and (min-width: 601px) {
        border-radius: ${props => props.theme.defaultRadius};
        overflow: hidden;
        width: 600px;
    }
`;

const TicketContent = styled.div`
    position: relative;
    top: calc(${props => props.theme.doubleSpacing} * -2);
    margin-bottom: calc(env(safe-area-inset-bottom) + 80px + 70px + 25px);
    display: flex;
    border-bottom-right-radius: ${props => props.theme.defaultRadius};
    overflow: hidden;

    @media screen and (min-width: 901px) {
        margin-bottom: 0;
    }
`;

const Details = styled.div`
    width: calc(100% - ${props => props.theme.smallSpacing});
`;

const Banner = styled.div`
    display: flex;
    background: linear-gradient(180deg, ${(props) => props.theme.darkBg}, ${(props) => props.theme.darkerBg});

    & button:last-child {
      text-transform: uppercase;
    }
`;

const QrLink = styled.div`
    padding: 12px;
    width: 100%;
    background-color: rgba(0,0,0,0.6);
`;

const Btn = styled(motion.div)`
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    padding: 12px;
    background-color: ${props => props.theme.textColor};
    border-radius: ${props => props.theme.defaultRadius};
    color: rgba(0,0,0,0.8);

    img {
        height: 40px;
    }
`;

const Timer = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;

    & > span:first-child {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    & > span:last-child {
        color: ${props => props.theme.textColorLight};
        margin-top: ${props => props.theme.smallSpacing};
        font-weight: 600;
        text-transform: uppercase;
    }
`;

