import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TicketsContext }                                  from '@frontend/core/lib/contexts/TicketsContext';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { v4 }                       from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { T721AppState }             from '../../redux';
import { isRequestError }                       from '@frontend/core/lib/utils/isRequestError';
import { TicketEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DatesSearchResponseDto }               from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoryEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { isNil }                          from 'lodash';
import styled, { keyframes }              from 'styled-components';
import { motion, useAnimation }           from 'framer-motion';
import { injectBlur }                     from '@frontend/flib-react/lib/utils/blur';
import { Icon }                           from '@frontend/flib-react/lib/components';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';
import { useWindowDimensions }            from '@frontend/core/lib/hooks/useWindowDimensions';
import qrcodePreview                      from '../../media/images/qrcodePreview.png';
import qrcodePreview2                     from '../../media/images/qrcodePreview2.png';
import { useHistory }                     from 'react-router-dom';
import { onlineLinkWrapper }              from '../../utils/onlineLinkWrapper';
import { useTranslation }                 from 'react-i18next';
import './locales';
import Countdown                                                   from 'react-countdown';

interface LiveAction {
    type: 'online' | 'physical';
    url?: string;
    ticket: TicketEntity;
    category: CategoryEntity;
    date: DateEntity;
}

export interface ShortcutState {
    visible: boolean;
    open: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    setVisible: () => void;
    setInvisible: () => void;
    actions: LiveAction[];
}

export const ShortcutContext = React.createContext<ShortcutState>({
    visible: true,
    open: false,
    openMenu: () => null,
    closeMenu: () => null,
    setVisible: () => null,
    setInvisible: () => null,
    actions: [],
});

export const ShortcutContextManager: React.FC<React.PropsWithChildren<any>> = (props: React.PropsWithChildren<any>) => {

    const [visible, setVisible] = useState(true);
    const [open, setOpen] = useState(false);
    const tickets = useContext(TicketsContext);
    const [la, setLa] = useState([]);

    return <>
        <ShortcutCategoriesFetcher
            categories={
                tickets.response.data?.tickets
                    ? tickets.response.data.tickets.map((tick: TicketEntity) => tick.category)
                    : []
            }
            setLa={setLa}
        />
        <ShortcutContext.Provider value={{
            visible: visible && la.length > 0,
            open,
            openMenu: () => setOpen(true),
            closeMenu: () => setOpen(false),
            setVisible: () => setVisible(true),
            setInvisible: () => setVisible(false),
            actions: la
        }}>
            {props.children}
        </ShortcutContext.Provider>
    </>

};

const ShortcutCategoriesFetcher: React.FC<{ categories: string[], setLa: (la: LiveAction[]) => void; }>
    = ({
           categories,
           setLa
       }: { categories: string[]; setLa: (la: LiveAction[]) => void }): JSX.Element => {

    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));

    const categoriesResp = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $in: categories,
                },
            },
        ],
        refreshRate: 30,
    }, uuid);

    if (isRequestError(categoriesResp) || categoriesResp.response.loading) {
        return <></>
    }

    return <ShortcutDatesFetcher
        dates={
            categoriesResp.response.data?.categories && categoriesResp.response.data.categories.length > 0
                ? categoriesResp.response.data.categories
                    .map((cat: CategoryEntity) => cat.dates)
                    .reduce((prev: string[], current: string[]) => prev.concat(current))
                : []
        }
        categories={categoriesResp.response.data?.categories || []}
        setLa={setLa}
    />;
};

const ShortcutDatesFetcher: React.FC<{ dates: string[]; categories: CategoryEntity[]; setLa: (la: LiveAction[]) => void }>
    = ({
           setLa,
           dates,
           categories
       }: { dates: string[]; categories: CategoryEntity[]; setLa: (la: LiveAction[]) => void }): JSX.Element => {
    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const tickets = useContext(TicketsContext);

    const datesResp = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $in: dates,
                },
            },
        ],
        refreshRate: 30,
    }, uuid);

    useEffect(() => {
        if (datesResp.response.data) {
            const _dates = datesResp.response.data.dates;
            setLa(tickets.response.data?.tickets
                ? tickets.response.data.tickets
                    .map(convertTicket.bind(null, _dates, categories) as (ticket: TicketEntity) => LiveAction[])
                    .reduce((las: LiveAction[], cur: LiveAction[]) => las.concat(cur), [])
                    .filter(isLinkAvailable)
                    .filter(isShortcutable)
                : [])
        }
    }, [tickets, datesResp, categories, setLa]);


    if (isRequestError(datesResp) || datesResp.response.loading) {
        return null;
    }

    return null;
};

const HOUR = 1000 * 60 * 60;

const isShortcutable = (la: LiveAction): boolean => {
    const begin = new Date(la.date.timestamps.event_begin);
    const end = new Date(la.date.timestamps.event_end);
    const now = new Date();

    return ((begin.getTime() - HOUR <= now.getTime())
        && (end.getTime() + HOUR >= now.getTime()));
};

const convertTicket = (dates: DateEntity[], categories: CategoryEntity[], ticket: TicketEntity): LiveAction[] => {

    const categoryIdx = categories.findIndex((cat: CategoryEntity): boolean => cat.id === ticket.category);

    if (categoryIdx === -1) {
        return [];
    }

    const category = categories[categoryIdx];

    return category.dates.map((dateId: string): LiveAction => {

        const dateIdx = dates.findIndex((_date: DateEntity) => _date.id === dateId);
        const date = dates[dateIdx];

        switch (date.online) {
            case true: {
                return {
                    type: 'online',
                    url: date.online_link,
                    ticket,
                    date,
                    category
                };
            }
            default: {
                return {
                    type: 'physical',
                    ticket,
                    date,
                    category
                };
            }
        }
    })

};

const isLinkAvailable = (liveAction: LiveAction): boolean => {
    switch (liveAction.type) {
        case 'online': {
            return !isNil(liveAction.url);
        }
        default: return true;
    }
};

interface ContainerProps {
    spacing: number;
    navbar: number;
    width: number;
    height: number;
}

const Glow = (color) => keyframes`
    0% {
        box-shadow: inset 0 0 0 #00000000, inset 0 0 0 #00000000, inset 0 0 0 #00000000, inset 0 0 0 #00000000;
    }
    25% {
        box-shadow: inset 0 0 2px ${color}30, inset 0 0 4px ${color}30, inset 0 0 8px ${color}30, inset 0 0 16px ${color}30, inset 0 0 32px ${color}20;
    }
    50% {
        box-shadow: inset 0 0 0 #00000000, inset 0 0 0 #00000000, inset 0 0 0 #00000000, inset 0 0 0 #00000000;
    }
    100% {
        box-shadow: inset 0 0 0 #00000000, inset 0 0 0 #00000000, inset 0 0 0 #00000000, inset 0 0 0 #00000000;
    }
`;

const Container = styled(motion.div)<ContainerProps>`
    left: ${props => props.spacing}px;
    bottom: calc(${props => props.spacing + props.navbar}px + env(safe-area-inset-bottom));
    bottom: calc(${props => props.spacing + props.navbar}px + constant(safe-area-inset-bottom));
    position: fixed;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    border-radius: 100%;
    z-index: 99999;
    cursor: pointer;

    ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};
    border: 1px solid ${(props) => props.theme.warningColor.hex}10;

    display: flex;
    justify-content: center;
    align-items: center;
    animation: ${(props) => Glow(props.theme.warningColor.hex)} 5s ease-in-out infinite alternate;
`;

const LiveIcon = styled(Icon)`
    transform: rotate(90deg);
`;

const LiveDot = styled.div`
    width: 1px;
    height: 1px;
`

interface BadgeProps {
    error: boolean;
}

const Badge = styled(motion.div)<BadgeProps>`
    position: absolute;
    left: 0;
    top: 0;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    background-color ${props => props.error ? 'red' : props.theme.warningColor.hex};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
`;

const BadgeNumber = styled.span`
    margin: 0;
    line-height: 100%;
    font-size: 14px;
    font-weight: 700;
`;

const Menu = styled(motion.div)<{spacing: number; navbar: number; width: number;}>`
    position: fixed;
    left: ${props => props.spacing}px;
    bottom: calc(${props => props.spacing + props.navbar}px + env(safe-area-inset-bottom));
    bottom: calc(${props => props.spacing + props.navbar}px + constant(safe-area-inset-bottom));
    ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};
    width: ${props => props.width - props.spacing * 2}px;
    z-index: 99999;
    max-width: 500px;
    border: 1px solid #cccccc10;
    border-radius: ${props => props.theme.defaultRadius};
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: calc(100vh * 0.5);
`

interface ShortcutActionLinkProps {
    shortcutAction: LiveAction;
    idx: number;
}

const DateIcon = styled.div<{avatar: string}>`
    width: 70px;
    height: 70px;
    border-radius: ${props => props.theme.defaultRadius};
    background-image: url(${props => props.avatar});
    background-size: cover;
    background-position: center;
`

const Ellipsed = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    line-height: 120%;
`

interface TicketCategoryTitleProps {
    gradientStart: string;
    gradientEnd: string;
}

const TicketCategoryTitle = styled.span<TicketCategoryTitleProps>`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    line-height: 120%;
    font-weight: 500;
    color: ${(props) => props.color};
    background: -webkit-linear-gradient(260deg, ${(props) => props.gradientStart}, ${(props) => props.gradientEnd});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;


const RedGlow = keyframes`
    from {
        text-shadow: 0 0 1px #ff000075, 0 0 2px #ff000075, 0 0 4px #ff000075, 0 0 6px #ff000075, 0 0 8px #ff000075, 0 0 10px #ff000075, 0 0 12px #ff000075;
    }
    to {
        text-shadow: 0 0 5px #ff000075, 0 0 10px #ff000075, 0 0 15px #ff000075, 0 0 20px #ff000075, 0 0 25px #ff000075, 0 0 30px #ff000075, 0 0 35px #ff000075;
    }
`;

const CTAQrCode = styled(motion.div)`
    width: 50px;
    height: 50px;
    border-radius: ${props => props.theme.defaultRadius};
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`

const CTALive = styled(motion.div)`
    width: 50px;
    height: 50px;
    border-radius: ${props => props.theme.defaultRadius};
    background-color: ${props => props.theme.darkBg};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &.glow span {
        animation: ${RedGlow} 3s ease-in-out infinite alternate;
    }
`

const twoDigits = (num: number) => {
    if (num < 10) {
        return `0${num}`;
    } else {
        return `${num}`;
    }
}

const renderer = (t, { hours, minutes, seconds, completed }) => {
    if (completed) {
        return null;
    } else {
        return <Ellipsed>{t('starts_in')}{twoDigits(minutes)}:{twoDigits(seconds)}</Ellipsed>;
    }
};

const ShortcutActionLink: React.FC<ShortcutActionLinkProps> = ({shortcutAction, idx}: ShortcutActionLinkProps): JSX.Element => {

    const history = useHistory();
    const haptics = useHaptics();
    const dispatch = useDispatch();
    const [t] = useTranslation('shortcut');

    const startDiff = new Date(shortcutAction.date.timestamps.event_begin).getTime() - Date.now();
    const endDiff = new Date(shortcutAction.date.timestamps.event_end).getTime() - Date.now() ;

    return <div
        style={{
            height: 100,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 12,
            paddingRight: 12
        }}
    >
        <DateIcon avatar={shortcutAction.date.metadata.avatar}/>
        <div
            style={{
                height: 70,
                width: 'calc(100% - 144px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}
        >
            <Ellipsed>{shortcutAction.date.metadata.name}</Ellipsed>
            <TicketCategoryTitle
                gradientStart={shortcutAction.date.metadata.signature_colors[0]}
                gradientEnd={shortcutAction.date.metadata.signature_colors[1]}
            >{shortcutAction.category.display_name}</TicketCategoryTitle>
            {
                startDiff < 0

                    ?
                    (
                        endDiff < 0

                            ?
                            <Ellipsed>{t('event_ended')}</Ellipsed>

                            :
                            <Ellipsed>{t('event_live')}</Ellipsed>
                    )

                    :
                    <Countdown
                        renderer={renderer.bind(null, t)}
                        date={new Date(shortcutAction.date.timestamps.event_begin)}
                    />
            }
        </div>
        {
            shortcutAction.type === 'physical'

                ?
                <CTAQrCode
                    whileTap={{
                        scale: 0.98
                    }}
                    onClick={
                        () => {
                            haptics.impact({
                                style: HapticsImpactStyle.Light
                            });
                            history.push(`/ticket/${shortcutAction.ticket.id}`)
                        }
                    }
                >
                    <img
                        alt={'QRCode'}
                        src={!!(idx % 2) ? qrcodePreview : qrcodePreview2}
                        style={{
                            width: 40,
                            height: 40
                        }}
                    />
                </CTAQrCode>

                :
                <CTALive
                    className={startDiff < 0 && endDiff > 0 ? 'glow' : undefined}
                    whileTap={{
                        scale: 0.98
                    }}
                    onClick={
                        () => {
                            haptics.impact({
                                style: HapticsImpactStyle.Light
                            });
                            onlineLinkWrapper(dispatch, t, shortcutAction.url, shortcutAction.date);
                        }
                    }
                >
                    <span
                        style={{
                            color: startDiff > 0 ? '#111111' : (endDiff > 0 ? 'red' : '#111111'),
                            fontWeight: 700,
                            lineHeight: '120%'
                        }}
                    >{t(startDiff < 0 && endDiff > 0 ? 'live' : 'off')}</span>
                </CTALive>
        }
    </div>
}

const CloseIcon = styled(Icon)`
    cursor: pointer;
`

export const ShortcutMenu: React.FC<any> = (props: any) => {

    const shortcut = useContext(ShortcutContext);
    const shortcutCount = useMemo(() => shortcut.actions.length, [shortcut]);
    const haptics = useHaptics();
    const controls = useAnimation();
    const [t] = useTranslation('shortcut');

    useEffect(() => {
        return () => {
            controls.start({
                scale: 1.5,
            }).then(() => {
                controls.start({
                    scale: 1,
                });
            });
        };
    }, [shortcutCount, controls]);

    const window = useWindowDimensions();
    const width = useMemo(() => window.width < 900 ? 65 : 80, [window.width]);
    const height = useMemo(() => window.width < 900 ? 65 : 80, [window.width]);
    const navbar = useMemo(() => window.width < 900 ? 80 : 0, [window.width]);
    const spacing = useMemo(() => window.width >= 900 ? 32 : 8, [window.width]);

    return <>
        <Container
            onClick={() => {
                haptics.impact({
                    style: HapticsImpactStyle.Medium
                });
                shortcut.openMenu()
            }}
            whileTap={{
                scale: 0.95
            }}
            spacing={spacing}
            navbar={navbar}
            width={width}
            height={height}
            initial={'hidden'}
            animate={shortcut.visible && !shortcut.open ? 'visible' : 'hidden'}
            variants={{
                visible: {
                    scale: 1,
                    opacity: 1,
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
                    scale: 1,
                    opacity: 1,
                    left: -(window.width + spacing),
                    rotate: -45,
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
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <>
                <LiveIcon
                    icon={'ticket'}
                    size={window.width <= 900 ? '30px' : '38px'}
                    color={'white'}
                />
                <LiveDot/>
                <Badge
                    error={false}
                    animate={controls}
                >
                    <BadgeNumber>{shortcutCount}</BadgeNumber>
                </Badge>
            </>
        </Container>
        <Menu
            width={window.width}
            spacing={spacing}
            navbar={navbar}
            initial={'hidden'}
            animate={shortcut.open && shortcut.visible ? 'visible' : 'hidden'}
            variants={{
                hidden: {
                    scale: 0,
                    opacity: 0,
                    transition: {
                        duration: 0.5,
                    },
                },
                visible: {
                    scale: 1,
                    opacity: 1,
                    transition: {
                        duration: 0.5,
                    },
                }
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: 40,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 24
                }}
            >
                <span
                    style={{
                        fontWeight: 500,
                        fontSize: 18
                    }}
                >{t('shortcut')}</span>
                <CloseIcon
                    icon={'close'}
                    color={'white'}
                    size={'14px'}
                    onClick={
                        () => {
                            haptics.impact({
                                style: HapticsImpactStyle.Medium
                            });
                            shortcut.closeMenu()
                        }
                    }
                />
            </div>
            <div
                style={{
                    width: 'calc(100% + 24px)',
                    height: 1,
                    backgroundColor: '#cccccc10',
                    marginLeft: -12
                }}
            />
            <div>
                {
                    shortcut.actions.map((la: LiveAction, idx: number) => (
                        <ShortcutActionLink shortcutAction={la} key={idx} idx={idx}/>
                    ))
                }
            </div>
        </Menu>
    </>;
};

