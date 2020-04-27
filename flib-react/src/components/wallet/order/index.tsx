import * as React from 'react';
import styled from '../../../config/styled';
import UserInterface from '../../../shared/userInterface';

export interface WalletOrderProps extends React.ComponentProps<any> {
  user: UserInterface;
  purchase: Purchase;
}

interface Purchase {
  eventName: string;
  amount: number;
}

const Container = styled.section`
  align-items: center;
  display: flex;
  color: ${props => props.theme.textColorDark};
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 500;
  padding: 0 ${props => props.theme.biggerSpacing};
  width: 100%;

  .row {
    margin-bottom: ${props => props.theme.regularSpacing};
  }
`

const Row = styled.div`
  align-items: center;
  color: ${props => props.theme.textColorDark};
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.smallSpacing};
  width: 100%;

  &.highlight {
    color: ${props => props.theme.textColor};
    font-size: 15px;
  }
`
export const WalletOrder: React.FunctionComponent<WalletOrderProps> = (props: WalletOrderProps): JSX.Element => {
  const afterPayment = props.user.creditBalance - props.purchase.amount;

  return <Container>
          <Row className="highlight">
            <span>{props.purchase.eventName }</span>
            <span>€ {props.purchase.amount}</span>
          </Row>
          <Row>
            <span>Current balance</span>
            <span>€ {props.user.creditBalance}</span>
          </Row>
          <Row>
            <span>After payment</span>
            <span>€ {afterPayment.toFixed(2)}</span>
          </Row>
        </Container>
};

export default WalletOrder;
