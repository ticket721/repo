import * as React from 'react';
import styled from '../../../../config/styled';
import CardContainer from '../../../elements/card-container';
import Separator from '../../../elements/separator';
import Icon from '../../../icon';

export interface DateTimeCardProps extends React.ComponentProps<any> {
  startDate: string;
  endDate: string;
  endTime: string;
  startTime: string;
  iconColor?: string;
  link?: string;
  linkLabel?: string;
  removeBg?: boolean;
  wSeparator?: boolean;
}

const Info = styled.span`
  &:first-of-type {
    margin-top: 2px;
  }

  &:last-of-type {
    color: ${props => props.theme.textColorDark};
    margin-top: 8px;
  }
`;

const Column = styled.div<DateTimeCardProps>`
  display: flex;
  flex-direction: column;

  a {
    align-items: center;
    display: inline-flex;
    margin-top: ${props => props.theme.regularSpacing};

    svg {
      margin-left: ${props => props.theme.smallSpacing};
    }

    ${props => props.iconColor &&`
      color: ${props.iconColor};
    `}
  }
`
const IconContainer = styled.div`
  margin-right: ${props => props.theme.regularSpacing};
`

export const DateTimeCard: React.FunctionComponent<DateTimeCardProps & {className?: string}> = (props: DateTimeCardProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg} className={props.className}>
          <IconContainer>
            <Icon icon='calendar' fill={props.iconColor} width='16' height='18' />
          </IconContainer>
          <Column iconColor={props.iconColor}>
            <Info>{props.startDate} - {props.endDate}</Info>
            <Info>{props.startTime} - {props.endTime}</Info>
             {/* TODO - Update to use react-router if necessary */}
             {props.link &&
              <a href={props.link}>{props.linkLabel} <Icon icon="chevron" height="12" width="8" fill={props.iconColor} /> </a>
            }
          </Column>

          {props.wSeparator &&
            <Separator />
          }
        </CardContainer>
};

export default DateTimeCard;
