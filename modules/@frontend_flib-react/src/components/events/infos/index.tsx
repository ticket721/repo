import * as React from 'react';
import styled from '../../../config/styled';
import LocationCard from '../../ticket/cards/location';
import DateTimeCard from '../../ticket/cards/datetime';

export interface EventInfosProps extends React.ComponentProps<any> {
    pullUp?: boolean;
    name: string;
    mainColor: string;
    location: string;
    startDate: string;
    gradients: string[];
    startTime: string;
    endDate: string;
    endTime: string;
    getDirections: string;
}

const Container = styled.div<EventInfosProps>`
  background-color: ${(props) => props.theme.darkerBg};
  position: relative;

  ${(props) =>
      props.pullUp &&
      `
    margin-top: -48px;
  `}
  padding: ${(props) =>
      props.pullUp ? `56px ${props.theme.biggerSpacing} ${props.theme.biggerSpacing}` : props.theme.biggerSpacing};

  h2 {
    margin-bottom: 12px;
    text-transform: uppercase;
  }
`;

const DateTime = styled(DateTimeCard)`
    background: none;
    padding: 12px 0;
`;

const Location = styled(LocationCard)`
    background: none;
    padding: 12px 0;
`;

export const EventInfos: React.FunctionComponent<EventInfosProps> = (props: EventInfosProps): JSX.Element => {
    return (
        <Container pullUp={props.pullUp}>
            <h2>{props.name}</h2>
            <DateTime
                startDate={props.startDate}
                startTime={props.startTime}
                endDate={props.endDate}
                endTime={props.endTime}
                iconColor={props.mainColor}
            />
            <Location iconColor={props.mainColor} location={props.location} subtitle={props.getDirections} />
        </Container>
    );
};

export default EventInfos;
