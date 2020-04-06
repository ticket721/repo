import * as React from 'react';
import styled from '../../../../../config/styled';
import Icon from '../../../icon';

export interface DateTimeCardProps extends React.ComponentProps<any> {
  startDate: string;
  endDate: string;
  endTime: string;
  startTime: string;
  iconColor?: string;
  link?: string;
  linkLabel?: string;
}

const Container = styled.div`
  display: flex;
  font-size: 14px;
  font-weight: 500;
  padding: 12px ${props => props.theme.biggerSpacing};

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

export const DateTimeCard: React.FunctionComponent<DateTimeCardProps> = (props: DateTimeCardProps): JSX.Element => {

  return <Container>
          <Icon icon='calendar' fill={props.iconColor} width='16' height='18' />
          <div className="column">
            <span>{props.startDate} - {props.endDate}</span>
            <span>{props.startTime} - {props.endTime}</span>
          </div>
        </Container>
};

export default DateTimeCard;
