import * as React from 'react';
import styled from '../../../config/styled';
import Link from '../link';
import Icon from '../icon';

let StyledNavbar = styled.nav`
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
  z-index: 10;

  a {
    padding: 0 1.25rem;
    opacity: 0.6;
    transition: opacity 300ms ease;

    &:hover {
      opacity: 1;
    }
  }
`

export const Navbar: React.FunctionComponent = (): JSX.Element => {
  return <StyledNavbar>
    <Link to="/">
      <Icon icon="home" fill="#fff" />
    </Link>
    <Link to="/">
      <Icon icon="search" fill="#fff" />
    </Link>
    <Link to="/" isActive>
      <Icon icon="t721" height="20" width="49" fill="#fff" />
    </Link>
    <Link to="/">
      <Icon icon="tag" fill="#fff"/>
    </Link>

    <Link to="/">
      <Icon icon="profile" fill="#fff" />
    </Link>
  </StyledNavbar>
}

export default Navbar;
