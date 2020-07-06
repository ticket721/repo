import React                    from 'react';
import styled                   from 'styled-components';
import { TicketHeader }         from '@frontend/flib-react/lib/components/ticket';
import TicketPreview            from '@frontend/flib-react/lib/components/ticket/infos';
import { Ticket }               from '../../types/ticket';

interface CardProps {
    ticket: Ticket
}

const TicketCard = ({ ticket }: CardProps) => {
    return (
        <Container>
            <TicketHeader cover={ticket.image} />
            <PullUp>
                <TicketPreview ticket={ticket} />
            </PullUp>
        </Container>
    );
}

const PullUp = styled.div`
    margin-top: -94px;
    position: relative;
    z-index: 1;
`;

const Container = styled.div`
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
`;

export default TicketCard;
