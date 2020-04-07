import * as React from 'react';
import styled from '../../config/styled';

const StyledNavbar = styled.nav`
  align-items: center;
  background-color: rgba(33, 29, 45, 0.6);
  backdrop-filter: blur(6px);
  border-top-left-radius: ${props => props.theme.doubleSpacing};
  border-top-right-radius: ${props => props.theme.doubleSpacing};
  display: flex;
  justify-content: space-between;
  padding: calc(${props => props.theme.regularSpacing} * 1.5) ${props => props.theme.doubleSpacing};
  width: 100%;
  z-index: 99999;
  position: fixed;
  bottom: 0;
`;

export const Navbar: React.FunctionComponent = (props): JSX.Element => {
  return <StyledNavbar>
    { props.children }
  </StyledNavbar>
};

export default Navbar;
