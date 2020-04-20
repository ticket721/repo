import * as React from 'react';
import styled from '../../../config/styled';
import TicketInterface from '../../../shared/ticketInterface';

export interface TicketHeaderProps extends React.ComponentProps<any> {
  ticket: TicketInterface;
  fullWidth?: boolean;
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
const Header = styled.header<TicketHeaderProps>`
  height: 40vh;
  overflow: hidden;
  position: relative;

  ${props => !props.fullWidth &&`
    border-top-left-radius: ${props.theme.defaultRadius};
    border-top-right-radius: ${props.theme.defaultRadius};
  `}

  ${props => props.fullWidth &&`
      &::before {
      background: linear-gradient(180deg, rgba(10, 11, 23, 0.7) 0%, rgba(17, 16, 24, 0) 100%);
      content: "";
      display: block;
      height: 100%;
      left: 0;
      position :absolute;
      top: 0;
      width: 100%;
    }
  `}

  img {
    height: 40vh;
    object-fit: cover;
    width: 100%;
  }
`;

export const TicketHeader: React.FunctionComponent<TicketHeaderProps> = (props: TicketHeaderProps): JSX.Element => {

  return <Header fullWidth={props.fullWidth}>
          {!props.fullWidth &&
            <TicketHeaderNumber>
              x{ props.ticket.number }
            </TicketHeaderNumber>
          }
          <img src={props.ticket.image} />
        </Header>
};

export default TicketHeader;
