import * as React from 'react';
import styled from '../../../config/styled';
import TicketInterface from '../../../shared/ticketInterface';
import LocationCard from '../../cards/location';
import DateTimeCard from '../../cards/datetime';

export interface PreviewInfosProps extends React.ComponentProps<any> {
  ticket: TicketInterface;
}

const PreviewContainer = styled.main`
  background: linear-gradient(180deg, ${props => props.theme.componentGradientStart}, ${props => props.theme.componentGradientEnd});
  border-bottom-left-radius: ${props => props.theme.defaultRadius};
  border-top-left-radius: ${props => props.theme.defaultRadius};
  font-size: 14px;
  font-weight: 500;
  padding: 12px 0;
  width: calc(100% - 8px);
`;

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
  background-color: #0B0912;
  content: "";
  display: block;
  height: 2px;
  position: relative;
  width: calc(100% + 8px);
  z-index: 100;

  &::before{
    background-color: #0B0912;
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
`

const Gradient = styled.div<PreviewInfosProps>`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), ${props => props.ticket.gradients.join(', ')});
  bottom: 0;
  content: '';
  height: 100%;
  position: absolute;
  right: 0;
  transform: matrix(-1, 0, 0, 1, 0, 0);
  width: 8px;

  &::after {
    background: linear-gradient(180deg, ${props => props.ticket.gradients.join(', ')});
    content: '';
    display: block;
    filter: blur(100px);
    height: 100%;
    opacity: 0.12;
    transform: matrix(-1, 0, 0, 1, 0, 0);
    width: 150px;
  }
`

const Subtitle = styled.span`
  color: ${props => props.theme.textColorDark};
  display: block;
  font-size: 13px;
  padding: 12px ${props => props.theme.biggerSpacing};
`;

export const PreviewInfos: React.FunctionComponent<PreviewInfosProps> = (props: PreviewInfosProps): JSX.Element => {

  return  <div>
            <TicketHeaderInfos>
              <h2>{props.ticket.name}</h2>
              <h3>{props.ticket.ticketType}</h3>
            </TicketHeaderInfos>
            <Separator />
            <PreviewContainer>
              <DateTimeCard
                endDate={props.ticket.endDate}
                endTime={props.ticket.endTime}
                iconColor={props.ticket.mainColor}
                startDate={props.ticket.startDate}
                startTime={props.ticket.startTime}
                removeBg
              />
              <LocationCard
                iconColor={props.ticket.mainColor}
                location={props.ticket.location}
                address={props.ticket.address}
                removeBg
              />

              {props.ticket.addOns &&
                <div>
                  <Subtitle>{props.ticket.addOns} add-ons purchased</Subtitle>
                </div>
              }
            </PreviewContainer>
            <Gradient ticket={props.ticket} />
          </div>
};


export default PreviewInfos;
