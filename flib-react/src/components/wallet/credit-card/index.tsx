import * as React from 'react';
import styled from '../../../config/styled';
import TextInput from '../../inputs/text';
import UserInterface from '../../../shared/userInterface';

export interface WalletCreditCardProps extends React.ComponentProps<any> {
  user: UserInterface;
}

const Input = styled(TextInput)`
  padding: ${props => props.theme.regularSpacing};
  margin-bottom: ${props => props.theme.smallSpacing};
  width: 100%;

  label {
    font-size: 10px;
    padding: 0;
  }

  input {
    padding: ${props => props.theme.smallSpacing} 0 0;
  }
`

const Container = styled.section`
  align-items: center;
  display: flex;
  color: ${props => props.theme.textColorDark};
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} 0;
  width: 100%;

  .row {
    ${Input} {
      width: calc(50% - 4px);
    }
  }
`

export const WalletCreditCard: React.FunctionComponent<WalletCreditCardProps> = (props: WalletCreditCardProps): JSX.Element => {

  return <Container>
          <Input
            label="Card number"
            placeholder="5555 5555 5555 5555"
            options= {{creditCard: true}}
            onChange
          />
          <div className="row jcsb">
            <Input
              label="Expiration date"
              placeholder="02/21"
              onChange
            />
            <Input
              label="Security number"
              placeholder="CVC"
              onChange
            />
          </div>
          <Input
            label="Name on card"
            placeholder="Add your full name"
            onChange
          />
        </Container>
};

export default WalletCreditCard;
