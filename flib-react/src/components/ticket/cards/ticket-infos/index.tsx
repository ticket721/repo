import * as React from 'react';
import styled from '../../../../../config/styled';
import Icon from '../../../icon';

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
  border-top-right-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;

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
  background-image: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientStart});
  padding: ${props => props.theme.doubleSpacing} ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
  position: relative;
  width: 100%;

  svg {
    position: absolute;
    right: -8px;
    top: 45%;
    transform: rotate(-90deg);
  }

  h2 {
    text-transform: uppercase;
  }

  h3 {
    color: ${props => props.theme.textColorDark};
    margin-top: ${props => props.theme.regularSpacing};
  }
`

const BottomInfos = styled.div`
  display: flex;
  width: 100%;

  div {
    background-color: rgba(0, 0, 0, 0.3);
    flex: 1;
    padding: ${props => props.theme.regularSpacing};
    text-align: center;

    &:first-child {
      background-color: rgba(0, 0, 0, 0.4);
    }

    &:last-child {
      background-color: rgba(0, 0, 0, 0.2);
    }

    label {
      color: ${props => props.theme.textColor};
    }

    span {
      display: block;
      font-size: 20px;
    }
  }
`

const TicketId = styled.span`
  color: ${props => props.theme.textColorDarker};
  display: block;
  font-size: 10px;
  margin-bottom: 8px;
`;

export const TicketInfosCard: React.FunctionComponent<TicketInfosCardProps> = (props: TicketInfosCardProps): JSX.Element => {

  return <Container>
          <TopInfo>
            <TicketId>{props.ticketID}</TicketId>
            <h2>{props.eventName}</h2>
            <h3>{props.ticketType}</h3>
            <Icon fill='rgba(255, 255, 255, 0.38)' height='20' width='48.5' icon='t721' />
          </TopInfo>
          {props.seatInfo &&
            <BottomInfos>
              <div>
                <label>Block</label>
                <span>{props.seatInfo.block}</span>
              </div>
              <div>
                <label>Row</label>
                <span>{props.seatInfo.row}</span>
              </div>
              <div>
                <label>Seat</label>
                <span>{props.seatInfo.number}</span>
              </div>
            </BottomInfos>
          }
        </Container>
};

export default TicketInfosCard;
