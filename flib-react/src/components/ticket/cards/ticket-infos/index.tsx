import * as React from 'react';
import styled from '../../../../../config/styled';

export interface TicketInfosCardProps extends React.ComponentProps<any> {
  ticketID?: string;
  eventName: string;
  ticketType?: string;
  seatInfo?: SeatProps;
}

interface SeatProps {
  block: string;
  row: string;
  number: string | number;
}

const Container = styled.section`
  background-image: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientStart});
  display: flex;
  font-size: 14px;
  font-weight: 500;

  span {
    &:first-of-type {
      margin-top: 2px;
    }

    &:last-of-type {
      color: ${props => props.theme.textColorDark};
      margin-top: 8px;
    }
  };

  svg {
    margin-right: ${props => props.theme.regularSpacing};
  }
`;

const TopInfo = styled.div`
  padding: ${props => props.theme.doubleSpacing} ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};

  h2 {
    text-transform: uppercase;
  }
`

export const TicketInfosCard: React.FunctionComponent<TicketInfosCardProps> = (props: TicketInfosCardProps): JSX.Element => {

  return <Container>
          <TopInfo>
            <h2>{props.eventName}</h2>
          </TopInfo>
        </Container>
};

export default TicketInfosCard;
