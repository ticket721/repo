import * as React from 'react';
import styled from '../../../config/styled';
import CardContainer from '../../elements/card-container';
import Icon from '../../icon';


export interface PurchaseTotalProps extends React.ComponentProps<any> {
  label: string;
  total: number;
  tickets: Tickets;
  taxes: number;
  subtotal: number;
  fees?: Fee[];
  addOns?: AddOn[];
  showFees?: boolean;
  toggleFees: () => void;
}

interface AddOn {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
}

interface Fee {
  id: string | number;
  name: string;
  price: number;
}

interface Tickets {
  quantity: number;
  price: number;
}

const Title = styled.h4`
  color: ${props => props.theme.textColorDarker};
  margin-bottom: ${props => props.theme.regularSpacing};
  width: 100%;

  & + h2 {
    margin-bottom: ${props => props.theme.biggerSpacing};
  }
`;

const Row = styled.div`
  align-items: center;
  color: ${props => props.theme.textColorDark};
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.smallSpacing};
  width: 100%;

  &.highlight {
    color: ${props => props.theme.textColor};
  }
`

const Separator = styled.span`
  background-color: ${props => props.theme.componentColorLighter};
  content: "";
  display: block;
  height: 2px;
  margin: ${props => props.theme.smallSpacing} 0 ${props => props.theme.regularSpacing} -24px;
  width: calc(100% + 24px);
`
const Collapsed = styled.div<PurchaseTotalProps>`
  max-height: ${props => props.showFees ? '1000px' : 0};
  opacity: ${props => props.showFees ? 1 : 0};
  overflow: hidden;
  transition: all 300ms ease;
`

const CollapsedContainer = styled.section<PurchaseTotalProps>`
  cursor: pointer;
  width: 100%;

  svg {
    position: relative;
    right: -8px;
    top: 1px;
    transform: ${props => props.showFees ? 'rotate(270deg)' : 'rotate(90deg)'} ;
  }
`

export const PurchaseTotal: React.FunctionComponent<PurchaseTotalProps> = (props:PurchaseTotalProps): JSX.Element => {
 const feesTotal = () => {
   let amount = 0;

   props.fees?.map((fee:Fee) => {
    amount += fee.price
   })

   return amount.toFixed(2);
  }

  return <CardContainer>
          <Title className="uppercase">{props.label}</Title>
          <h2>{props.total}€</h2>
          <Row>
            <span>Tickets x{props.tickets.quantity}</span>
            <span>{props.tickets.price.toFixed(2)}€</span>
          </Row>
          {props.addOns?.map((addOn: AddOn) => {
            return <Row key={addOn.id}>
              <span>{addOn.name} x{addOn.quantity}</span>
              <div>{addOn.price.toFixed(2)}€</div>
            </Row>
          })}
          <Separator />
          <Row>
            <span>Subtotal</span>
            <span>{props.subtotal.toFixed(2)}€</span>
          </Row>
          {props.fees &&
            <CollapsedContainer showFees={props.showFees}>
              <Row>
                <span className="row" onClick={props.toggleFees}>Fees<Icon icon="chevron" height="10" width="6" fill="rgba( 255, 255, 255, 0.6)"/></span>
                <span>{feesTotal()}€</span>
              </Row>
              <Collapsed showFees={props.showFees}>
              {props.fees.map((fee:Fee) => {
                return <Row key={fee.id}><span>{fee.name}</span><span>{fee.price.toFixed(2)}</span></Row>
              })}
              </Collapsed>
            </CollapsedContainer>
          }
          <Row>
            <span>Taxes</span>
            <span>{props.taxes.toFixed(2)}€</span>
          </Row>
          <Separator />
          <Row className="highlight">
            <span>Total</span>
            <span>{props.total.toFixed(2)}€</span>
          </Row>
        </CardContainer>
};

export default PurchaseTotal;
