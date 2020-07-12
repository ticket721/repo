import * as React             from 'react';
import styled                 from '../../../config/styled';
import TextInput              from '../../inputs/text';

export interface WalletCreditCardProps extends React.ComponentProps<any> {
  onCCCodeChange: (code: string) => void;
  onCCCCVChange: (ccv: string) => void;
  onCCExpirationDateChange: (expiration: string) => void;
  onCCNameChange: (name: string) => void;
}

const Input = styled(TextInput)`
    padding: ${(props) => props.theme.regularSpacing};
    margin-bottom: ${(props) => props.theme.smallSpacing};
    width: 100%;

    label {
        font-size: 10px;
        padding: 0;
    }

    input {
        padding: ${(props) => props.theme.smallSpacing} 0 0;
    }
`;

const Container = styled.section`
    align-items: center;
    display: flex;
    color: ${(props) => props.theme.textColorDark};
    flex-wrap: wrap;
    font-size: 13px;
    font-weight: 500;
    padding: ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.biggerSpacing} 0;
    width: 100%;

    .row {
        ${Input} {
            width: calc(50% - 4px);
        }
    }
`;

const eventExtracter = (e: any): string => {
  return e.target.value;
};

export const WalletCreditCard: React.FunctionComponent<WalletCreditCardProps> = (
  props: WalletCreditCardProps,
): JSX.Element => {
  return (
    <Container>
      <Input label={'Card number'} placeholder={'5555 5555 5555 5555'} options={{ creditCard: true }} onChange={(e: any) => props.onCCCodeChange(eventExtracter(e))} />
      <div className={'row jcsb'}>
        <Input label={'Expiration date'} placeholder={'02/21'} options={{ date: true, datePattern: ['m', 'd'] }} onChange={(e: any) => props.onCCCCVChange(eventExtracter(e))} />
        <Input label={'Security number'} placeholder={'CVC'} options={{ blocks: [3], numericOnly: true }} onChange={(e: any) => props.onCCExpirationDateChange(eventExtracter(e))} />
      </div>
      <Input label={'Name on card'} placeholder={'Add your full name'} onChange={(e: any) => props.onCCNameChange(eventExtracter(e))} />
    </Container>
  );
};

export default WalletCreditCard;
