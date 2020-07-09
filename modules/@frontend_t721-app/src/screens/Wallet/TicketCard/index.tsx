import React              from 'react';
import styled             from 'styled-components';
import { TicketHeader }   from '@frontend/flib-react/lib/components/ticket';
import TicketPreview      from '@frontend/flib-react/lib/components/ticket/infos';
import { useTranslation } from 'react-i18next';
import { Ticket }         from '../../../types/ticket';
import './locales';
import { useHistory }     from 'react-router';
import { getImgPath }     from '@frontend/core/lib/utils/images';

interface TicketCardProps {
    ticket: Ticket
}

const TicketCard = ({ ticket }: TicketCardProps) => {
    const history = useHistory();
    const [t] = useTranslation('ticket');

    return (
        <Container onClick={() => history.push(`/ticket/${ticket.ticketId}`)}>
            <TicketHeader cover={getImgPath(ticket.image)}/>
            <PullUp>
                <TicketPreview ticket={ticket} addonsPurchased={t('no_addons')}/>
            </PullUp>
        </Container>
    );
};

const Container = styled.div`
    border-bottom-left-radius: ${props => props.theme.smallSpacing};
    border-bottom-right-radius: ${props => props.theme.smallSpacing};
    overflow: hidden;
    width: calc(100% - 24px);
`;

const PullUp = styled.div`
    position: relative;
    top: -${props => props.theme.doubleSpacing};
    margin-bottom: -${props => props.theme.doubleSpacing};
`;

export default TicketCard;
