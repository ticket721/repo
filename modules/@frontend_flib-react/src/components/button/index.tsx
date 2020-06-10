import * as React from 'react';
import { rgba }   from 'polished';
import styled     from '../../config/styled';
import { Loader } from '../loader';

export interface ButtonProps extends React.ComponentProps<any> {
    title: string;
    gradients?: string[];
    onClick?: () => void;
    loadingState?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    variant: 'primary' | 'secondary' | 'custom' | 'warning' | 'error';
    type?: string;
}

const StyledButton = styled.button<ButtonProps>`
    ${(props) =>
        (props.variant === 'secondary' || props.disabled) &&
        `
    background-color: ${rgba('#FFFFFF', 0.1)};
    transition: background-color 300ms ease;

    &:hover {
        background-color: ${rgba('#FFFFFF', 0.25)};
    }

    &::before {
        display: none;
    }
  `};

    ${(props) =>
        props.variant === 'primary' && !props.disabled &&
        `
    background: linear-gradient(260deg, ${props.theme.primaryColor.hex}, ${props.theme.primaryColorGradientEnd.hex});

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${props.theme.primaryColor.hex}, ${props.theme.primaryColorGradientEnd.hex});
    }
  `};

    ${(props) =>
        props.variant === 'custom' && !props.disabled &&
        `
    background: linear-gradient(260deg, ${props.gradients?.join(', ')});

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${props.gradients?.join(
          ', ',
      )});
    }
  `};

    ${(props) =>
        props.variant === 'warning' && !props.disabled &&
        `
    background-color: ${rgba(props.theme.warningColor.hex, 0.4)};
    transition: background-color 300ms ease;

    &::before {
      background-color: ${rgba(props.theme.warningColor.hex, 0.9)};
    }
`};

    ${(props) =>
        props.variant === 'error' && !props.disabled &&
        `
      background-color: ${rgba(props.theme.errorColor.hex, 0.4)};
      transition: background-color 300ms ease;

      &::before {
        background-color: ${rgba(props.theme.errorColor.hex, 0.9)};
      }
  `};

    align-items: center;
    border-radius: ${(props) => props.theme.defaultRadius};
    color: rgba(255, 255, 255, 0.9);
    display: inline-flex;
    font-size: 15px;
    font-weight: 500;
    justify-content: center;
    line-height: 1em;
    margin: calc(${(props) => props.theme.regularSpacing} * 0.75) 0;
    overflow: hidden;
    padding: ${(props) => props.theme.regularSpacing};
    position: relative;
    width: 100%;

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

    & > span {
        display: flex;
        justify-content: center;
        padding-top: 1px;
        position: relative;
        z-index: 1;
    }

    & > div {
        position: absolute;
    }
`;

export const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps): JSX.Element => {
    if (!props.hidden) {
        return (
          <StyledButton
            name={props.title}
            onClick={props.onClick}
            gradients={props.gradients}
            variant={props.variant}
            type={props.type}
            {...props}
          >
            {
              props.loadingState ?
                <Loader
                  size={'120%'}/> :
                null
            }
            <span>{props.title}</span>
          </StyledButton>
        );
    }

    return <></>;
};

Button.defaultProps = {
    variant: 'primary',
    type: 'button',
};

export default Button;
