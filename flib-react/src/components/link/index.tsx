import React from 'react';
import styled from '../../../config/styled';
import { Icon } from '../icon';

export interface LinkProps extends React.ComponentProps<any> {
  label?: string;
  to: string;
  wIcon?: boolean;
  iconName?: string;
  isActive?:boolean;
}

const LinkInner = styled.span<LinkProps>`
  display: block;

  ${props => props.icon && `
    margin-right: 1rem;
  `}

`;


const StyledLink = styled.a<LinkProps>`
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


  ${props => props.isActive  &&`
    opacity: 1;

    &::after {
      background-color: ${props.theme.primaryColor};
      border-radius: 100%;
      bottom: -1rem;
      content: "";
      display: block;
      height: 4px;
      left: 0;
      margin auto;
      position: absolute;
      right: 0;
      width: 4px;
    }
  `}
`;

export const Link: React.FunctionComponent<LinkProps> = (props: LinkProps): JSX.Element => {
  const content = (
    <>
      <LinkInner icon={props.wIcon}>
        { props.children }
        { props.label }
      </LinkInner>
      { props.wIcon && <Icon icon={props.iconName ? props.iconName : ""} /> }
    </>
  );


return <StyledLink isActive={props.isActive} href={props.to}>{content}</StyledLink>

}

export default Link;
