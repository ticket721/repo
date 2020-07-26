import React, { useEffect, useState } from 'react';
import { Ticket }                     from '../../types/ticket';
import Flicking            from '@egjs/react-flicking';
import styled              from 'styled-components';
import TicketCard                from './TicketCard';
import { useHistory } from 'react-router';

interface TicketsProps {
    tickets: Ticket[];
}

export const Tickets: React.FC<TicketsProps> = ({ tickets }) => {
    const history = useHistory();
    const [ ticketIdx, setTicketIdx ] = useState<number>(0);

    useEffect(() => {
        const ticketIdxMatch = history.location.search.match(/ticketIdx=([0-9]+)/);
        if (ticketIdxMatch && parseInt(ticketIdxMatch[1], 10) < tickets.length) {
            setTicketIdx(parseInt(ticketIdxMatch[1], 10));
        }
    }, [history.location.search, tickets.length]);

    return <TicketList>
        <Flicking
            classPrefix={'listing'}
            defaultIndex={
                history.location.search.match(/ticketIdx=([0-9]+)/) &&
                parseInt(history.location.search.match(/ticketIdx=([0-9]+)/)[1], 10) < tickets.length ?
                parseInt(history.location.search.match(/ticketIdx=([0-9]+)/)[1], 10) :
                0
            }
            overflow={true}
            collectStatistics={false}
            autoResize={true}
            gap={32}
            bound={true}
            onChange={(e) => history.push('/wallet?ticketIdx=' + e.index)}>
            {
                tickets.map(ticket => (
                    <TicketCard key={ticket.ticketId} ticket={ticket}/>
                ))
            }
        </Flicking>
        <Dots>
            {
                tickets.map((ticket, idx) => (
                    <Dot key={ticket.ticketId} selected={idx === ticketIdx}/>
                ))
            }
        </Dots>
    </TicketList>
};

const TicketList = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 ${props => props.theme.biggerSpacing};
    overflow: hidden;
    height: calc(100vh - 3 * ${props => props.theme.doubleSpacing});

    .listing-viewport {
        height: calc(100vh - 3 * ${props => props.theme.doubleSpacing}) !important;

        .listing-camera {
            display: flex;
            align-items: center;
        }
    }
`;

const Dots = styled.div`
    position: absolute;
    bottom: ${props => props.theme.biggerSpacing};
    left: 0;
    display: flex;
    justify-content: center;
    width: 100%;
`;

const Dot = styled.div<{ selected: boolean }>`
    width: ${props => props.theme.smallSpacing};
    height: ${props => props.theme.smallSpacing};
    border-radius: 8px;
    background-color: ${props => props.selected ? props.theme.textColor : props.theme.componentColorLight};

    :not(:last-child) {
        margin-right: ${props => props.theme.smallSpacing};
    }
`;
