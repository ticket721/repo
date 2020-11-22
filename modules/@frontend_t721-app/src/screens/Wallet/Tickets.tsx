import React, { useEffect, useMemo, useState } from 'react';
import styled                         from 'styled-components';
import TicketCard                     from './TicketCard';
import { useHistory }                 from 'react-router';
import { CategoryEntity }             from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DateEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventEntity }                 from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import { Page, motion, AnimateSharedLayout, AnimatePresence } from 'framer';
import MediaQuery from 'react-responsive';
import { useWindowDimensions } from '@frontend/core/lib/hooks/useWindowDimensions';

interface TicketsProps {
    tickets: TicketEntity[];
    categories: {[key: string]: CategoryEntity};
    dates: {[key: string]: DateEntity};
    events: {[key: string]: EventEntity};
}

export const Tickets: React.FC<TicketsProps> = ({ tickets , categories, dates, events}) => {
    const history = useHistory();
    const [ currentIdx, setCurrentIdx ] = useState<number>(0);
    const { width } = useWindowDimensions();
    useEffect(() => {
        const ticketIdxMatch = history.location.search.match(/ticketIdx=([0-9]+)/);
        if (ticketIdxMatch && parseInt(ticketIdxMatch[1], 10) < tickets.length) {
            setCurrentIdx(parseInt(ticketIdxMatch[1], 10));
        }
    }, [history.location.search, tickets.length]);

    const paddingPage = useMemo(() => Math.pow(width, 2)/5000, [width]);
    const gapPage = useMemo(() => Math.pow(width, 2)/9000, [width]);

    const buildDots = (): JSX.Element => {
        const firstIdx: number = Math.max(0, Math.min(currentIdx - 3, tickets.length - 7));
        const lastIdx: number = Math.min(firstIdx + 6, tickets.length - 1);

        const offset: number = ((Math.min(7, tickets.length) - 1) / 2) * 14;

        return <Dots leftOffset={-offset}>{
            tickets
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
                onClick={() => setCurrentIdx(idx)}>
                    {
                        idx === currentIdx ?
                        <SelectedDot layoutId={'selected-dot'}/> :
                        null
                    }
                </Dot>
            })
        }</Dots>
    };

    return <>
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
                onChangePage={(idx) => setCurrentIdx(idx)}>
                    {
                        tickets.map(ticket => {
                            const ticketCategory: CategoryEntity = categories[ticket.category];
                            const ticketDates: DateEntity[] = ticketCategory.dates.map((dateId: string): DateEntity => dates[dateId]);
                            const event: EventEntity = events[ticketDates[0].event];

                            return <TicketCard key={ticket.id} ticket={ticket} category={ticketCategory} dates={ticketDates} event={event}/>;
                        })
                    }
                </Page>
                {
                    tickets.length > 1 ?
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
                    tickets.map(ticket => {
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
    width: min(100vw, 1296px);
    margin: ${props => props.theme.regularSpacing};

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
