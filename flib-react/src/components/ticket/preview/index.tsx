import * as React from 'react';
import Icon from '../../icon';
import styled from '../../../../config/styled';
import TicketInterface from '../../../shared/ticketInterface';

export interface TicketPreviewProps extends React.ComponentProps<any> {
  ticket: TicketInterface;
}

const TicketHeaderNumber = styled.div`
  background: #FFF;
  border-bottom-left-radius: ${props => props.theme.defaultRadius};
  color: #060814;
  font-size: 12px;
  font-weight: 500;
  padding: calc(${props => props.theme.regularSpacing} / 2);
  position: absolute;
  right: 0;
  top: 0;
`

const TicketHeaderInfos = styled.div`
  background-image: linear-gradient(180deg, #241F33 0%, #1B1726 100%);
  border-top-right-radius: ${ props => props.theme.defaultRadius};
  bottom: 0;
  left: 0;
  padding: ${props => props.theme.doubleSpacing} ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
  position: absolute;
  width: calc(100% - 8px);

  h2 {
    font-size: 1rem;
    opacity: 0.9;
    text-transform: uppercase;
  }

  h3 {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    opacity: 0.6;
  }
`

const TicketHeader = styled.header`
  border-radius: ${ props => props.theme.defaultRadius };
  height: 35vh;
  overflow: hidden;
  position: relative;

  img {
    height: 35vh;
    object-fit: cover;
    width: 100%;
  }
`

const TicketMain = styled.main`
  padding: ${props => props.theme.biggerSpacing};
`

const StyledTicketPreview = styled.article`
  margin: 18px;
`

export const TicketPreview: React.FunctionComponent<TicketPreviewProps> = (props: TicketPreviewProps): JSX.Element => {

  return <StyledTicketPreview>
      <TicketHeader>
        <TicketHeaderNumber>
          x{ props.ticket.number }
        </TicketHeaderNumber>
        <img src={props.ticket.image} />
        <TicketHeaderInfos>
          <h2>{props.ticket.name}</h2>
          <h3>{props.ticket.ticketType}</h3>
        </TicketHeaderInfos>
      </TicketHeader>
      <TicketMain>
        <Icon icon="calendar" fill="#D19F02" />
        <Icon icon="location" fill="#D19F02" />
        <span>{props.ticket.addOns} add-ons purchased</span>
      </TicketMain>
    </StyledTicketPreview>
};


export default TicketPreview;
