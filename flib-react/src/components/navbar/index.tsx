import * as React from 'react';
import styled from '../../config/styled';

const StyledNavbar = styled.nav`
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

  a {
    align-items: center;
    color: #fff;
    display: inline-flex;
    opacity: 0.6;
    padding: 0 1.25rem;
    position: relative;
    text-decoration: none;
    transition: opacity 300ms ease;

    &:hover {
      opacity: 1;
    }


    &.active {
      opacity: 1;

      &::after {
        background-color: ${props => props.theme.primaryColor};
        border-radius: 100%;
        bottom: -1rem;
        content: "";
        display: block;
        height: 4px;
        left: 0;
        margin: auto;
        position: absolute;
        right: 0;
        width: 4px;
      }
    }
  }`

export const Navbar: React.FunctionComponent = (props): JSX.Element => {
  return <StyledNavbar>
    { props.children }
  </StyledNavbar>
}

export default Navbar;
