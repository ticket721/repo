import * as React from 'react';
import styled from '../../../../config/styled';
import Icon from '../../icon';
import TicketInterface from '../../../shared/ticketInterface';
import Gradient from '../../../shared/gradients';

export interface PreviewInfosProps extends React.ComponentProps<any> {
  ticket: TicketInterface;
}

const PreviewContainer = styled.main`
  background: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientEnd});
  border-radius: ${props => props.theme.defaultRadius};
  font-size: 14px;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  width: calc(100% - 8px);

  .row {
    margin-bottom: ${props => props.theme.regularSpacing};

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .column {
    margin-left: ${props => props.theme.regularSpacing};

    span {
      margin: 4px 0;

      &:last-of-type {
        color: ${props => props.theme.textColorDark};
      }
    }
  }
`

const TicketHeaderInfos = styled.div`
  background-image: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientStart});
  border-top-right-radius: ${ props => props.theme.defaultRadius};
  padding: ${props => props.theme.doubleSpacing} ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
  width: calc(100% - 8px);

  h2 {
    color: ${props => props.theme.textColor};
    font-size: 1rem;
    text-transform: uppercase;
  }

  h3 {
    color: ${props => props.theme.textColorDark};
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
`
const Separator = styled.div`
  background-color: ${props => props.theme.componentGradientEnd};
  content: "";
  display: block;
  height: 2px;
  position: relative;
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

const Subtitle = styled.span`
  color: ${props => props.theme.textColorDark};
  font-size: 13px;
`;

export const PreviewInfos: React.FunctionComponent<PreviewInfosProps> = (props: PreviewInfosProps): JSX.Element => {

  return  <div>
            <TicketHeaderInfos>
              <h2>{props.ticket.name}</h2>
              <h3>{props.ticket.ticketType}</h3>
            </TicketHeaderInfos>
            <Separator />
            <PreviewContainer>
              <div className="row">
                <Icon icon='calendar' fill={props.ticket.mainColor} width='16' height='18' />
                <div className="column">
                  <span>{props.ticket.startDate} - {props.ticket.endDate}</span>
                  <Subtitle>{props.ticket.startTime} - {props.ticket.endTime}</Subtitle>
                </div>
              </div>
              <div className="row">
                <Icon icon='location' fill={props.ticket.mainColor} width='12' height='16' />
                <div className="column">
                  <span>{props.ticket.location}</span>
                  <Subtitle>{props.ticket.address}</Subtitle>
                </div>
              </div>
              {props.ticket.addOns &&
                <div>
                  <Subtitle>{props.ticket.addOns} add-ons purchased</Subtitle>
                </div>
              }
            </PreviewContainer>
            <Gradient gradients={props.ticket.gradients} />
          </div>
};


export default PreviewInfos;
