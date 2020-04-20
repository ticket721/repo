import * as React from 'react';
import { rgba } from 'polished';
import breakpoint from 'styled-components-breakpoint';
import styled from '../../config/styled';

export interface ButtonProps extends React.ComponentProps<any> {
  title: string;
  gradients?: string[];
  onClick: () => void;
  type: 'primary' | 'secondary' | 'custom' | 'warning';
}

const StyledButton = styled.button<ButtonProps>`
  ${props => props.type === 'primary' &&`
    background: linear-gradient(260deg, ${props.theme.primaryColor}, ${props.theme.primaryColorGradientEnd});

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${props.theme.primaryColor}, ${props.theme.primaryColorGradientEnd});
    }
  `};

  ${props => props.type === 'secondary' &&`
    background-color: ${rgba('#FFFFFF', 0.1)};
    transition: background-color 300ms ease;

    &:hover {
      background-color: ${rgba('#FFFFFF', 0.25)};
    }

    &::before {
      display: none;
    }
  `};

  ${props => props.type === 'custom' &&`
    background: linear-gradient(260deg, ${props.gradients?.join(', ')});

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${props.gradients?.join(', ')});
    }
  `};

  ${props => props.type === 'warning' &&`
    background-color: ${rgba(props.theme.warningColor, 0.4)};
    transition: background-color 300ms ease;

    &::before {
      background-color: ${rgba(props.theme.warningColor, 0.9)};
    }
`};

  align-items: center;
  border-radius: ${props => props.theme.defaultRadius};
  color: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  font-size: 15px;
  font-weight: 500;
  justify-content: center;
  line-height: 1em;
  margin: calc(${props => props.theme.regularSpacing} * 0.75) 0;
  overflow: hidden;
  padding: ${props => props.theme.regularSpacing};
  position: relative;
  width: 100%;

  ${breakpoint('desktop')
    `font-size: 15px;`
  }

  &::before {
    content: '';
    display: block;
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transition: opacity 300ms ease;
    width: 100%;
  }

  &:hover {
    &::before {
      opacity: 1;
    }
  }

  span {
    display: flex;
    justify-content: center;
    padding-top: 1px;
    position: relative;
    z-index: 1;
  }
`;

export const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps): JSX.Element => {

  return <StyledButton
      name={props.title}
      onClick={props.onClick}
      gradients={props.gradients}
      type={props.type}
    >
      <span>{props.title}</span>
    </StyledButton>
};

Button.defaultProps = {
  type: 'primary'
};

export default Button;



