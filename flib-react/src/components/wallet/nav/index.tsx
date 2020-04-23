import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface WalletNavProps extends React.ComponentProps<any> {
  title: string;
  showPrev?: boolean;
}

const Container = styled.section`
  align-items: center;
  display: flex;
  padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} 0;
  width: 100%;

  h2 {
    line-height: 1;
  }

  button {
    margin-left: auto;
  }
`
const ArrowIcon = styled(Icon)`
  margin-right: ${props => props.theme.regularSpacing};
`

export const WalletNav: React.FunctionComponent<WalletNavProps> = (props: WalletNavProps): JSX.Element => {

  return <Container>
          {props.showPrev &&
            <ArrowIcon icon="arrow" height="16" width="16" fill="rgba(255, 255, 255, 0.9)" />
          }
          <h2>{props.title}</h2>
          <button>
            <Icon icon="close" height="14" width="14" fill="rgba(255, 255, 255, 0.6)" />
          </button>
        </Container>
};

export default WalletNav;
