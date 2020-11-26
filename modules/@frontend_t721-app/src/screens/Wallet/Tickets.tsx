import React, { useEffect, useMemo, useState } from 'react';
import styled                                  from 'styled-components';
import TicketCard                              from './TicketCard';
import { useHistory }                          from 'react-router';
import { CategoryEntity }                      from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }                        from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DateEntity }                          from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventEntity }                    from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import {
    Page,
    motion,
    AnimateSharedLayout,
    AnimatePresence,
}                                         from 'framer';
import MediaQuery                         from 'react-responsive';
import { useWindowDimensions }            from '@frontend/core/lib/hooks/useWindowDimensions';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/utils/useHaptics';
import { isNil }                          from 'lodash';
import { useTranslation }                 from 'react-i18next';
import { OnlineBadge }                    from '@frontend/flib-react/lib/components/events/single-image/OnlineTag';
import { formatShort }                    from '@frontend/core/lib/utils/date';

const Title = styled.div`
    font-weight: bold;
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.fontStack};
    margin-top: ${props => props.theme.regularSpacing};

    h1 {
        display: inline;
        text-align: start;
        font-size: 24px;
        margin: ${props => props.theme.regularSpacing};
    }
    h2 {
        display: inline;
        font-size: 18px;
        font-weight: 500;
        opacity: 0.4;
        margin: ${props => props.theme.smallSpacing};
        cursor: pointer;
    }
    @media screen and (max-width: 900px) {
      text-align: center;
    }

    @media screen and (min-width: 901px) {
        width: 100%;
        margin-top: ${props => props.theme.doubleSpacing};
        padding-left: ${props => props.theme.doubleSpacing};
    }
`;


interface TicketsProps {
    tickets: TicketEntity[];
    categories: { [key: string]: CategoryEntity };
    dates: { [key: string]: DateEntity };
    events: { [key: string]: EventEntity };
}

const HOUR = 1000 * 60 * 60;

interface DateWithScore {
    date: DateEntity;
    score: number;
}

const getBestScore = (datesWithScores: DateWithScore[], categories: { [key: string]: CategoryEntity }, ticket: TicketEntity): number => {
    const category = categories[ticket.category];

    if (!category) {
        return Infinity;
    }

    const categoryDatesWithScore = datesWithScores
        .filter((dateWithScore: DateWithScore) => {
            return category.dates.indexOf(dateWithScore.date.id) !== -1;
        })
        .sort((dws1, dws2) => dws1.score - dws2.score);

    if (categoryDatesWithScore.length === 0) {
        return Infinity;
    }

    return categoryDatesWithScore[0].score;
};

const comingTicketsSort = (
    dates: DateEntity[],
    datesTimeDistances: number[],
    categories: { [key: string]: CategoryEntity },
    ticket1: TicketEntity,
    ticket2: TicketEntity): number => {

    let datesWithScores: DateWithScore[] = [];

    for (let idx = 0; idx < dates.length; ++idx) {
        datesWithScores.push({
            date: dates[idx],
            score: datesTimeDistances[idx],
        });
    }

    datesWithScores = datesWithScores.sort((dws1, dws2) => dws1.score - dws2.score);

    return getBestScore(datesWithScores, categories, ticket1) - getBestScore(datesWithScores, categories, ticket2);
};

const ticketsThatMatterFilter = (
    now: number,
    dates: { [key: string]: DateEntity },
    categories: { [key: string]: CategoryEntity },
    ticket: TicketEntity,
): boolean => {
    const category = categories[ticket.category];

    if (!category) {
        return false;
    }

    const datesOfCategory = category.dates
        .map((id: string): DateEntity => dates[id])
        .filter((date: DateEntity) => !isNil(date))
        .filter((date: DateEntity) => {
            return (new Date(date.timestamps.event_end)).getTime() - HOUR > now
        });

    return datesOfCategory.length > 0;
};

const ticketsOfThePastFilter = (
    now: number,
    dates: { [key: string]: DateEntity },
    categories: { [key: string]: CategoryEntity },
    ticket: TicketEntity,
): boolean => {
    const category = categories[ticket.category];

    if (!category) {
        return false;
    }

    const datesOfCategory = category.dates
        .map((id: string): DateEntity => dates[id])
        .filter((date: DateEntity) => !isNil(date))
        .filter((date: DateEntity) => {
            return (new Date(date.timestamps.event_end)).getTime() - HOUR <= now
        });

    return datesOfCategory.length > 0;
};

const useTime = (itv: number) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {

        const itvid = setTimeout(() => {
            setNow(Date.now());
        }, itv);

        return () => {
            clearTimeout(itvid);
        };

    }, [now, itv]);

    return now;
};

const useStateWithLocalStorage = (localStorageKey, initialValue = null) => {
    const [value, setValue] = React.useState(
        JSON.parse(localStorage.getItem(localStorageKey)) || initialValue
    );

    React.useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value, localStorageKey]);

    return [value, setValue];
};

export const Tickets: React.FC<TicketsProps> = (props: TicketsProps) => {
    const [mode, setMode] = useStateWithLocalStorage('ticket_mode', 'live');

    switch (mode) {
        case 'live': {
            return <LiveTickets
                {...props}
                changeMode={() => setMode('past')}
            />
        }
        case 'past': {
            return <PastTickets
                {...props}
                changeMode={() => setMode('live')}
            />
        }
    }
}

interface MonthSection {
    tickets: TicketEntity[];
    month: string;
}

const getClosestDate = (now: number, category: CategoryEntity, dates: {[key: string]: DateEntity}): DateEntity => {
    const categoryDates = category.dates
        .map((did: string): DateEntity => dates[did])
        .sort((d1: DateEntity, d2: DateEntity): number => {
            return new Date(d1.timestamps.event_begin).getTime() - new Date(d2.timestamps.event_begin).getTime()
        });

    if (categoryDates.length === 0) {
        return null
    }

    return categoryDates[0];
}

const monthStr = (date: DateEntity, language: string): string => {
    const begin = new Date(date.timestamps.event_begin);
    return `${begin.toLocaleString(language, {month: 'short'})} ${begin.getFullYear()}`;
}

const getTicketSections = (
    now: number,
    tickets: TicketEntity[],
    categories: {[key: string]: CategoryEntity},
    dates: {[key: string]: DateEntity},
    language: string
): MonthSection[] => {
    const sections: {[key: string]: MonthSection} = {};
    const sectionNames: string[] = [];

    const sortedTickets = tickets
        .sort((t1: TicketEntity, t2: TicketEntity): number => {
            const t1d = getClosestDate(now, categories[t1.category], dates);
            const t2d = getClosestDate(now, categories[t2.category], dates);

            const t1dtimestamp = new Date(t1d.timestamps.event_begin).getTime();
            const t2dtimestamp = new Date(t2d.timestamps.event_begin).getTime();

            if (t1dtimestamp === t2dtimestamp) {
                return new Date(t2.created_at).getTime() - new Date(t1.created_at).getTime();
            } else {
                return t2dtimestamp - t1dtimestamp;
            }

        })

    for (const ticket of sortedTickets) {
        const sectionName = monthStr(getClosestDate(now, categories[ticket.category], dates), language);

        if (!sections[sectionName]) {
            sectionNames.push(sectionName);
            sections[sectionName] = {
                tickets: [ticket],
                month: sectionName
            }
        } else {
            sections[sectionName].tickets.push(ticket)
        }
    }

    return sectionNames.map((name: string): MonthSection => sections[name]);

}

const PastTicketList = styled.div`
    width: 100vw;
    margin-bottom: calc(80px + env(safe-area-inset-bottom));
    margin-bottom: calc(80px + constant(safe-area-inset-bottom));
    margin-top: ${props => props.theme.regularSpacing};
`;

const PastTicketDashboard = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100vw;
    @media screen and (min-width: 1296px) {
      width: 1296px;
    }
    margin-bottom: 80px;

    & > div {
        width: calc((100% - 3 * ${props => props.theme.doubleSpacing}) / 3);
        margin: ${props => props.theme.regularSpacing};
        cursor: pointer;

        transition: transform 300ms ease, filter 300ms ease;

        @media screen and (max-width: 992px) {
            width: calc((100% - 2 * ${props => props.theme.doubleSpacing}) / 2);
        }
    }
`;

const MonthTitle = styled.span`
  text-transform: uppercase;
  font-weight: 500;
  font-size: 14px;
`

const TicketMiniCardContainer = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background-color: ${props => props.theme.darkerBg};
  border-radius: ${props => props.theme.defaultRadius};
  margin-top: ${props => props.theme.regularSpacing};
  padding: ${props => props.theme.smallSpacing};
  display: flex;
  flex-direction: row;
`

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

const DateInfosContainer = styled.div`
  width: calc(100% - 80px - ${props => props.theme.regularSpacing});
  height: 80px;
  margin-left: ${props => props.theme.regularSpacing};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 4px;
  padding-bottom: 4px;
`

interface CategoryNameProps {
    gradientStart: string;
    gradientEnd: string;
}

const CategoryName = styled.span<CategoryNameProps>`
  display: block;
  width: calc(100%);
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 120%;
    background: -webkit-linear-gradient(260deg, ${(props) => props.gradientStart}, ${(props) => props.gradientEnd});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`

const DateTitle = styled.span`
  display: block;
  width: calc(100%);
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 120%;
`

const DateTime = styled.span`
  display: block;
  width: calc(100%);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 120%;
`

const TicketMiniCard = ({ticket, category, date}: {ticket: TicketEntity, category: CategoryEntity, date: DateEntity}): JSX.Element => {

    const haptics = useHaptics();
    const history = useHistory();

    return <TicketMiniCardContainer
        whileTap={{
            scale: 0.98
        }}
        onClick={() => {
            haptics.impact({
                style: HapticsImpactStyle.Light,
            });
            history.push(`/ticket/${ticket.id}`)
        }}
    >
        <DateIcon
            width={80}
            height={80}
            avatar={date.metadata.avatar}
            online={date.online}
        />
        <DateInfosContainer>
            <DateTitle>{date.metadata.name}</DateTitle>
            <CategoryName
                gradientStart={date.metadata.signature_colors[0]}
                gradientEnd={date.metadata.signature_colors[1]}
            >{category.display_name}</CategoryName>
            <DateTime>{formatShort(new Date(date.timestamps.event_begin))}</DateTime>
        </DateInfosContainer>
    </TicketMiniCardContainer>
}

const TicketSection = (
    {section, now, categories, dates}:
        {section: MonthSection, now: number, categories: {[key: string]: CategoryEntity}, dates: {[key: string]: DateEntity}}
): JSX.Element => {
    return <div
        style={{
            padding: 12,
            marginTop: 24,
        }}
    >
        <MonthTitle>{section.month}</MonthTitle>
        <div
            style={{
                paddingLeft: 12,
                paddingRight: 12
            }}
        >
            {
                section.tickets.map((ticket: TicketEntity, idx: number) => (
                        <TicketMiniCard
                            key={idx}
                            ticket={ticket}
                            category={categories[ticket.category]}
                            date={getClosestDate(now, categories[ticket.category], dates)}
                        />
                    )
                )
            }
        </div>
    </div>

}

const PastTickets: React.FC<TicketsProps & {changeMode: () => void}> = (
    { tickets, categories, dates, events , changeMode}
) => {

    const haptics = useHaptics();
    const [ t, i18n ] = useTranslation(['wallet', 'common']);
    const now = useTime(5000);

    const filteredTickets = useMemo(() => tickets
            .filter(ticketsOfThePastFilter.bind(null, now, dates, categories)),
        [now, dates, categories, tickets])
    const sortedTickets = useMemo(() => getTicketSections(now, filteredTickets, categories, dates, i18n.language),
        [now, categories, dates, i18n, filteredTickets]);

    return <>
        <Title>
            <h2
                onClick={() => {
                    haptics.impact({
                        style: HapticsImpactStyle.Light,
                    });
                    changeMode();
                }}
            >
                {t('my_tickets')}
            </h2>
            <h1>
                {t('my_past_tickets')}
            </h1>
        </Title>
        <MediaQuery maxWidth={680}>
            <PastTicketList>
                {
                    sortedTickets.map((ms: MonthSection, idx: number) => (
                        <TicketSection
                            section={ms}
                            now={now}
                            categories={categories}
                            dates={dates}
                            key={idx}
                        />
                    ))
                }
            </PastTicketList>
        </MediaQuery>
        <MediaQuery minWidth={681}>
            <PastTicketDashboard>
                {
                    sortedTickets.map((ms: MonthSection, idx: number) => (
                        <TicketSection
                            section={ms}
                            now={now}
                            categories={categories}
                            dates={dates}
                            key={idx}
                        />
                    ))
                }
            </PastTicketDashboard>
        </MediaQuery>
    </>;

}

const EmptyWallet = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 108px);
    color: ${props => props.theme.textColorDark};
    font-weight: 500;
    @media screen and (max-width: 680px) {
      justify-content: center;
      align-items: center;
    }
    & > span {
      margin-top: ${props => props.theme.regularSpacing};
    }

    & > div {
        display: flex;
        color: ${props => props.theme.primaryColorGradientEnd.hex};
        margin-top: ${props => props.theme.regularSpacing};

        & > span:last-child {
            margin-left: ${props => props.theme.smallSpacing};
            margin-bottom: 2px;
            transform: rotate(-90deg);
        }
    }
`;

const LiveTickets: React.FC<TicketsProps & {changeMode: () => void}> = (
    { tickets, categories, dates, events , changeMode}
) => {
    const history = useHistory();
    const [currentIdx, setCurrentIdx] = useState<number>(0);
    const { width } = useWindowDimensions();
    const now = useTime(5000);
    useEffect(() => {
        const ticketIdxMatch = history.location.search.match(/ticketIdx=([0-9]+)/);
        if (ticketIdxMatch && parseInt(ticketIdxMatch[1], 10) < tickets.length) {
            setCurrentIdx(parseInt(ticketIdxMatch[1], 10));
        }
    }, [history.location.search, tickets.length]);
    const haptics = useHaptics();
    const [ t ] = useTranslation(['wallet', 'common']);

    const paddingPage = useMemo(() => Math.pow(width, 2) / 5000, [width]);
    const gapPage = useMemo(() => Math.pow(width, 2) / 9000, [width]);
    const datesArray = useMemo(() => Object.values(dates), [dates]);
    const datesTimeDistances = useMemo(() =>
            datesArray.map(
                (dateEntity: DateEntity): number => {
                    const start = new Date(dateEntity.timestamps.event_begin).getTime();
                    const difference = (start - now) / HOUR;

                    if (difference < 0) {
                        return Math.abs(difference) * 2;
                    }
                    return difference;
                },
            ),
        [datesArray, now],
    );
    const sortedTickets = useMemo(
        () => tickets
            .filter(ticketsThatMatterFilter.bind(null, now, dates, categories))
            .sort(comingTicketsSort.bind(null, datesArray, datesTimeDistances, categories)),
        [tickets, now, dates, categories, datesArray, datesTimeDistances]
    );

    const buildDots = (): JSX.Element => {
        const firstIdx: number = Math.max(0, Math.min(currentIdx - 3, sortedTickets.length - 7));
        const lastIdx: number = Math.min(firstIdx + 6, sortedTickets.length - 1);

        const offset: number = ((Math.min(7, sortedTickets.length) - 1) / 2) * 14;

        return <Dots leftOffset={-offset}>{
            sortedTickets
                .map((ticket, idx) => {
                    let dotSize: number;
                    if (firstIdx > idx || idx > lastIdx) {
                        dotSize = 0;
                    } else {
                        dotSize = Math.max(5, 11 - 2 * Math.abs(idx - currentIdx));
                    }

                    return <Dot
                        key={ticket.id}
                        size={dotSize}
                        offset={(idx - firstIdx) * 14}
                        onClick={() => {
                            haptics.impact({
                                style: HapticsImpactStyle.Light,
                            });
                            setCurrentIdx(idx);
                        }}>
                        {
                            idx === currentIdx ?
                                <SelectedDot layoutId={'selected-dot'}/> :
                                null
                        }
                    </Dot>;
                })
        }</Dots>;
    };

    return <>
        <Title>
            <h1>
                {t('my_tickets')}
            </h1>
            <h2
                onClick={() => {
                    haptics.impact({
                        style: HapticsImpactStyle.Light,
                    });
                    changeMode();
                }}
            >
                {t('my_past_tickets')}
            </h2>
        </Title>
        {
            sortedTickets.length === 0

                ?
                <>
                    <MediaQuery maxWidth={680}>
                        <EmptyWallet>
                            <span>{t('no_coming_tickets')}</span>
                        </EmptyWallet>
                    </MediaQuery>
                    <MediaQuery minWidth={681}>
                        <PastTicketDashboard>
                            <EmptyWallet>
                                <span>{t('no_coming_tickets')}</span>
                            </EmptyWallet>
                        </PastTicketDashboard>
                    </MediaQuery>
                </>

                :
                <>
                    <MediaQuery maxWidth={680}>
                        <TicketList>
                            <Page
                                paddingLeft={paddingPage}
                                paddingRight={paddingPage}
                                width={width}
                                height={'100%'}
                                contentHeight={'auto'}
                                gap={gapPage}
                                alignment={'center'}
                                defaultEffect={'coverflow'}
                                currentPage={currentIdx}
                                onChangePage={(idx) => {
                                    haptics.impact({
                                        style: HapticsImpactStyle.Light,
                                    });
                                    setCurrentIdx(idx);
                                }}>
                                {
                                    sortedTickets.map(ticket => {
                                        const ticketCategory: CategoryEntity = categories[ticket.category];
                                        const ticketDates: DateEntity[] = ticketCategory.dates.map((dateId: string): DateEntity => dates[dateId]);
                                        const event: EventEntity = events[ticketDates[0].event];

                                        return <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            category={ticketCategory}
                                            dates={ticketDates}
                                            event={event}
                                        />;
                                    })
                                }
                            </Page>
                            {
                                sortedTickets.length > 1 ?
                                    <AnimateSharedLayout>
                                        <AnimatePresence>
                                            {
                                                buildDots()
                                            }
                                        </AnimatePresence>
                                    </AnimateSharedLayout> :
                                    null
                            }
                        </TicketList>
                    </MediaQuery>
                    <MediaQuery minWidth={681}>
                        <TicketDashboard>
                            {
                                sortedTickets.map(ticket => {
                                    const ticketCategory: CategoryEntity = categories[ticket.category];
                                    const ticketDates: DateEntity[] = ticketCategory.dates.map((dateId: string): DateEntity => dates[dateId]);
                                    const event: EventEntity = events[ticketDates[0].event];

                                    return <TicketCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        category={ticketCategory}
                                        dates={ticketDates}
                                        event={event}/>;
                                })
                            }
                        </TicketDashboard>
                    </MediaQuery>
                </>
        }
    </>;
};

const TicketList = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    width: 100vw;
    height: calc(100vh - 3 * 50px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
`;

const Dots = styled.div<{ leftOffset: number }>`
    position: absolute;
    bottom: ${props => props.theme.biggerSpacing};
    left: ${props => props.leftOffset}px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    transition: left 200ms ease;
`;

const Dot = styled.div<{ size: number, offset: number }>`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;

    border-radius: 16px;
    background-color: ${props => props.theme.textColorDarker};

    transform: translateX(${props => props.offset}px);
    transition: transform 200ms ease, width 200ms ease, height 200ms ease;
`;

const SelectedDot = styled(motion.div)`
    position: relative;
    width: 100%;
    height: 100%;
    background-color: ${props => props.theme.textColor};
    border-radius: 16px;
`;

const TicketDashboard = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100vw;
    @media screen and (min-width: 1296px) {
      width: 1296px;
    }
    margin-bottom: 80px;

    & > div {
        width: calc((100% - 3 * ${props => props.theme.doubleSpacing}) / 3);
        margin: ${props => props.theme.regularSpacing};
        cursor: pointer;

        transition: transform 300ms ease, filter 300ms ease;

        @media screen and (max-width: 992px) {
            width: calc((100% - 2 * ${props => props.theme.doubleSpacing}) / 2);
        }

        :hover {
            filter: drop-shadow(0 0 20px black);
            transform: scale(1.03);
        }
    }
`;
