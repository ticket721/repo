import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface TicketSingleProps extends React.ComponentProps<any> {
  addOns?: any[];
  color?: string;
  gradient?: string[];
  feesIncluded?: boolean;
  selected?:boolean;
  price: string;
  resale?: boolean;
  soldBy: string;
  ticketsLeft: number;
}

const Container = styled.article<TicketSingleProps>`
  background-color: ${props => props.selected ? props.theme.darkerBg : props.theme.darkBg};
  border-bottom: 2px solid #000;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  position: relative;
  transition: background-color 300ms ease;

  h2 {
    ${props => props.resale && `
      font-size: 15px;
      font-weight: 500;
    `}
  }

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

  div:last-child {
    color: ${props => props.theme.textColorDarker};
    font-size: 14px;
    margin-top: 12px;
  }
`

const TicketCount = styled.span<TicketSingleProps>`
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

const Resale = styled.span<TicketSingleProps>`
  color: ${props => props.addOns ? props.theme.textColorDark : props.theme.textColorDarker};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 50%;
`

export const TicketSingle: React.FunctionComponent<TicketSingleProps> = (props: TicketSingleProps): JSX.Element => {
  return <Container selected={props.selected} resale={props.resale} gradient={props.gradient}>
          <div className="row aic jcsb">
            <h2>Sold by {props.soldBy}</h2>
            <span>{props.price} /each</span>
          </div>
          <div className="row aic jcsb">
          {props.resale ? (
              <Resale addOns={props.addOns}>{props.addOns ? props.addOns.join(', ') : 'No add-ons'}</Resale>
          ) : (
            <TicketCount ticketsLeft={props.ticketsLeft}>
              <Icon icon="ticket" fill={props.color} width="18" height="18" />
              {props.ticketsLeft < 1 ? 'Sold out' : `${props.ticketsLeft} left`}
            </TicketCount>
          )}
          <span>{props.feesIncluded ? 'Fees included' : '+ fees'}</span>
          </div>
        </Container>
}

export default TicketSingle;

TicketSingle.defaultProps = {
  color: '#079CF0',
  gradient: ['#079CF0','#2143AB']
}
