import * as React from 'react';
import styled from '../../../config/styled';
import { detect } from 'detect-browser';
import Icon from '../../icon';

const browser = detect();


export interface WalletContainerProps extends React.ComponentProps<any> {
  title: string;
  showPrev?: boolean;
  showWallet?: boolean;
  toggleWallet: (show: boolean) => void;
}

const Container = styled.section<WalletContainerProps>`
  background-color: ${browser?.name === 'firefox' ? 'rgba(33, 29, 45, 0.95)' : 'rgba(33, 29, 45, 0.6)'};

  ${browser?.name !== 'firefox' &&`
    backdrop-filter: blur(40px);
  `}

  border-top-left-radius: ${props => props.theme.bigRadius};
  border-top-right-radius: ${props => props.theme.bigRadius};
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  left: 0;
  opacity: ${props => props.toggle  ? 1 : 0};
  position: fixed;
  right: 0;
  transform: ${props => props.toggle ? 'translateY(0px)' : 'translateY(100%)'};
  transition: all 300ms ease;
  z-index: 10000;
`;

const Nav = styled.nav`
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

export const WalletContainer: React.FunctionComponent<WalletContainerProps & {className?: string}> = (props: WalletContainerProps): JSX.Element => {

  return <Container className={props.className} toggle={props.showWallet}>
          <Nav>
            {props.showPrev &&
              <ArrowIcon icon="arrow" height="16" width="16" fill="rgba(255, 255, 255, 0.9)" />
            }
            <h2>{props.title}</h2>
            <button onClick={() => props.toggleWallet(false)}>
              <Icon icon="close" height="14" width="14" fill="rgba(255, 255, 255, 0.6)" />
            </button>
          </Nav>
          {props.children}
        </Container>
};

export default WalletContainer;
