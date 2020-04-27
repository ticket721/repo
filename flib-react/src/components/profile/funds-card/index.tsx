import * as React from 'react';
import styled from '../../../config/styled';
import UserInterface from '../../../shared/userInterface';
import Icon from '../../icon';

export interface FundsCardProps extends React.ComponentProps<any> {
  user: UserInterface;
  title?: string;
  onClick: () => void;
  icon?: string;
  currentBalanceLabel: string;
  bankAccountLabel: string;
}

const Section = styled.section`
  padding: ${props => props.theme.biggerSpacing};
`

const Container = styled.section<FundsCardProps>`
  background:  linear-gradient(222.61deg, #11A869 0%, #0D8251 100%);
  border-radius: ${props => props.theme.defaultRadius};
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  margin-top: ${props => props.theme.regularSpacing};
  padding: ${props => props.theme.biggerSpacing};
  position: relative;

  .space--top {
    margin-top: 48px;
  }

  h4 {
    color: ${props => props.theme.textColorDarker};
  }
`
const CardNumber = styled.span`
  display: block;
  margin-top: 8px;
`

const Amount = styled.span`
  font-size: 28px;
  display: block;
  margin-top: 8px;

  sup {
    display: inline-block;
    font-size: 12px;
    margin-left: 4px;
  }
`

const IconContainer = styled.div`
  background-color: rgba(19, 21, 35, 0.2);
  border-top-left-radius: ${props => props.theme.defaultRadius};
  bottom: 0;
  padding: ${props => props.theme.regularSpacing};
  position: absolute;
  right: 0;

  svg {
    height: 12px;
    transform: rotate(180deg);
  }
`

export const FundsCard: React.FunctionComponent<FundsCardProps> = (props: FundsCardProps): JSX.Element => {

  return <Section>
          <h2>{props.title}</h2>
          <Container>
            <div>
              <div>
                <h4 className="uppercase">{props.bankAccountLabel}</h4>
                <CardNumber>************ {props.user.creditCard}</CardNumber>
              </div>
              <div className="space--top">
                <h4 className="uppercase">{props.currentBalanceLabel}</h4>
                <Amount>{props.user.creditBalance}<sup>€</sup> </Amount>
              </div>
            </div>
            {props.icon &&
              <Icon className="icon--euro" icon={props.icon} height="24" width="22" fill="rgba(255, 255, 255, 0.9)" />
            }
            <IconContainer onClick={props.onClick}>
              <Icon icon="arrow" height="16" width="16" fill="rgba(255, 255, 255, 0.9)" />
            </IconContainer>
          </Container>
        </Section>
};

export default FundsCard;
