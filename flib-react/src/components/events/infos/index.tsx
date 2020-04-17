import * as React from 'react';
import styled from '../../../../config/styled';
import eventInterface from '../../../shared/eventInterface';
import LocationCard from '../../cards/location';
import DateTimeCard from '../../cards/datetime';

export interface EventInfosProps extends React.ComponentProps<any> {
  event: eventInterface;
  pullUp?: boolean;
}

const Container = styled.div<EventInfosProps>`
  padding: ${props => props.pullUp ? `56px ${props.theme.biggerSpacing}` : props.theme.biggerSpacing};

  h2 {
    margin-bottom: 12px;
    text-transform: uppercase;
  }
`

const DateTime = styled(DateTimeCard)`
  background: none;
  padding: 12px 0;
`

const Location = styled(LocationCard)`
  background: none;
  padding: 12px 0;
`

export const EventInfos: React.FunctionComponent<EventInfosProps> = (props: EventInfosProps): JSX.Element => {

  return  <Container pullUp={props.pullUp}>
            <h2>{props.event.name}</h2>
            <DateTime
              startDate={props.event.startDate}
              startTime={props.event.startTime}
              endDate={props.event.endDate}
              endTime={props.event.endTime}
              iconColor={props.event.mainColor}
            />
            <Location
              iconColor={props.event.mainColor}
              location={props.event.location}
              address={props.event.address}
            />

          </Container>
};


export default EventInfos;
