import * as React from 'react';
import styled from '../../../../config/styled';
import TicketInterface from '../../../shared/ticketInterface';

export interface TicketHeaderProps extends React.ComponentProps<any> {
  ticket: TicketInterface;
}

const TicketHeaderNumber = styled.div`
  background: ${props => props.theme.textColor};
  border-bottom-left-radius: ${props => props.theme.defaultRadius};
  color: #060814;
  font-size: 12px;
  font-weight: 500;
  padding: calc(${props => props.theme.regularSpacing} / 2);
  position: absolute;
  right: 0;
  top: 0;
`
const Header = styled.header`
  height: 40vh;
  overflow: hidden;
  position: relative;

  img {
    height: 40vh;
    object-fit: cover;
    width: 100%;
  }
`

export const TicketHeader: React.FunctionComponent<TicketHeaderProps> = (props: TicketHeaderProps): JSX.Element => {

  return <Header>
          <TicketHeaderNumber>
            x{ props.ticket.number }
          </TicketHeaderNumber>
          <img src={props.ticket.image} />
        </Header>
};


export default TicketHeader;
