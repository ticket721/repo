import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface TicketTypeProps extends React.ComponentProps<any> {
  color?: string;
  gradient?: string[];
  description: string;
  feesIncluded?: boolean;
  selected?:boolean;
  soldOutLabel: string;
  startingPrice: string;
  startingPriceLabel: string;
  title: string;
  ticketsLeft: number;
  ticketsLeftLabel: string;
}

const Container = styled.article<TicketTypeProps>`
  background-color: ${props => props.selected ? props.theme.darkerBg : props.theme.darkBg};
  border-bottom: 2px solid #000;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  position: relative;
  transition: background-color 300ms ease;

  &:last-of-type{
    border: none;
  }

  &:before {
    background: linear-gradient(260deg, ${props => props.gradient?.join(', ')});
    content: "";
    display: block;
    height: 100%;
    left: 0;
    opacity: ${props => props.selected ? 1 : 0};
    position: absolute;
    top: 0;
    transition: opacity 300ms ease;
    width: 2px;
  }

  h4 {
    font-size: 15px;
    margin: ${props => props.theme.regularSpacing} 0 ${props => props.theme.smallSpacing};

    & + span {
      color: ${props => props.theme.textColorDarker};
    }
  }

  p {
    color: ${props => props.theme.textColorDark};
    margin-top: ${props => props.theme.regularSpacing};
  }

`

const TicketCount = styled.span<TicketTypeProps>`
  align-items: center;
  color: ${props => props.ticketsLeft < 1 ? props.theme.textColorDark : props.theme.textColor};
  display: inline-flex;
  font-size: 14px;
  font-weight: 500;

  svg {
    margin-right: ${props => props.theme.smallSpacing};
    position: relative;
    top: -2px;
  }
`

export const TicketType: React.FunctionComponent<TicketTypeProps> = (props: TicketTypeProps): JSX.Element => {

  return <Container selected={props.selected} gradient={props.gradient}>
            <div className="row aic jcsb">
              <h3>{props.title}</h3>
              <TicketCount ticketsLeft={props.ticketsLeft}><Icon icon="ticket" fill={props.color} width="18" height="18" />{props.ticketsLeft < 1 ? props.soldOutLabel : `${props.ticketsLeft} ${props.ticketsLeftLabel}`}</TicketCount>
            </div>
            <h4>{props.startingPriceLabel} {props.startingPrice}</h4>
            <span>{props.feesIncluded ? 'Fees included' : '+ fees'}</span>
            <p>{props.description}</p>
          </Container>
};

TicketType.defaultProps = {
  color: '#079CF0',
  gradient: ['#079CF0','#2143AB']
}

export default TicketType;
