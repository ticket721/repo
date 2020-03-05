import * as React from 'react';
import styled from '../../../config/styled';

export interface NavbarProps extends React.ComponentProps<any> {
}

const StyledNavbar = styled.nav<NavbarProps>`
  align-items: center;
  background-color: rgba(33, 29, 45, 0.6);
  backdrop-filter: blur(6px);
  border-top-left-radius: ${props => props.theme.doubleSpacing};
  border-top-right-radius: ${props => props.theme.doubleSpacing};
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  padding: calc(${props => props.theme.regularSpacing} * 1.5) ${props => props.theme.doubleSpacing};
  position: fixed;
  width: 100%;
`

export const Navbar: React.FunctionComponent<NavbarProps> = (props: NavbarProps): JSX.Element => {
  return <StyledNavbar>
    <a href="#todo">O</a>
  </StyledNavbar>
}

export default Navbar;
