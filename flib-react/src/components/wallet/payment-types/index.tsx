import * as React from 'react';
import styled from '../../../config/styled';
import UserInterface from '../../../shared/userInterface';
import RadioButton from '../../inputs/radio';

export interface WalletPaymentTypesProps extends React.ComponentProps<any> {
  user: UserInterface;
  onChange: (value: string, id: string, e: React.ChangeEvent<HTMLElement> ) => void;
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
export const WalletPaymentTypes: React.FunctionComponent<WalletPaymentTypesProps> = (props: WalletPaymentTypesProps): JSX.Element => {

  return <Container>
          <div className="row aic jcsb">
            <RadioButton
              label="Credit card"
              name="payment-type"
              onChange={props.onChange}
              value="cc"
            />
            <span>Ends with {props.user.creditCard}</span>
          </div>
          <div className="row aic jcsb">
            <RadioButton
              label="Your balance"
              name="payment-type"
              onChange={props.onChange}
              value="user-balance"
            />
            <span>€ {props.user.creditBalance}</span>
          </div>
        </Container>
};

export default WalletPaymentTypes;
