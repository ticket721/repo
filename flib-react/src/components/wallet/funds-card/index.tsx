import * as React from 'react';
import styled from '../../../config/styled';
import UserInterface from '../../../shared/userInterface';

export interface FundsCardProps extends React.ComponentProps<any> {
  user: UserInterface;
}

const Container = styled.section<FundsCardProps>`
  align-items: center;
  display: flex;
`

export const FundsCard: React.FunctionComponent<FundsCardProps> = (props: FundsCardProps): JSX.Element => {

  return <Container profileHeader={props.profileHeader}>

        </Container>
};

export default FundsCard;
