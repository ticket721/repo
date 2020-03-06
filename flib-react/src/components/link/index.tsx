import React from 'react';
import styled from '../../../config/styled';
import { Icon } from '../icon';

export interface LinkProps extends React.ComponentProps<any> {
  label?: string;
  to: string;
  wIcon?: boolean;
  iconName?: string;
}

const LinkInner = styled.span<LinkProps>`
  display: block;

  ${props => props.icon && `
    margin-right: 1rem;
  `}

`;


const StyledLink = styled.a`
  align-items: center;
  color: #fff;
  display: inline-flex;
  text-decoration: none;
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


return <StyledLink href={props.to}>{content}</StyledLink>

}

export default Link;
