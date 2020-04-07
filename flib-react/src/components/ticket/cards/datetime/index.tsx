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
  wSeparator?: boolean;
}

const Container = styled.div`
  background-image: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientStart});
  display: flex;
  font-size: 14px;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  position: relative;

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


const Separator = styled.div`
  background-color: ${props => props.theme.componentColor};
  bottom: 0;
  content: "";
  display: block;
  height: 2px;
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 100;

  &::before,
  &::after {
    background-color: ${props => props.theme.componentGradientEnd};
    content: "";
    display: inline-block;
    height: ${props => props.theme.regularSpacing};
    position: absolute;
    top: -7px;
    transform: rotate(45deg);
    width: ${props => props.theme.regularSpacing};
  }

  &::before {
    left: -8px;
  }

  &::after {
    right: -8px;
  }
`

export const DateTimeCard: React.FunctionComponent<DateTimeCardProps> = (props: DateTimeCardProps): JSX.Element => {

  return <Container>
          <Icon icon='calendar' fill={props.iconColor} width='16' height='18' />
          <div className="column">
            <span>{props.startDate} - {props.endDate}</span>
            <span>{props.startTime} - {props.endTime}</span>
          </div>

          {props.wSeparator &&
            <Separator />
          }
        </Container>
};

export default DateTimeCard;
