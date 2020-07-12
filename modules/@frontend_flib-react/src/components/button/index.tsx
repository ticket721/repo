import * as React from 'react';
import { rgba } from 'polished';
import styled from '../../config/styled';
import Icon from '../icon';
import { keyframes } from 'styled-components';

export interface ButtonProps extends React.ComponentProps<any> {
    title: string;
    gradients?: string[];
    onClick?: () => void;
    loadingState?: boolean;
    hidden?: boolean;
    variant: 'primary' | 'secondary' | 'custom' | 'warning' | 'danger' | 'disabled';
    type?: string;
    icon?: string;
    iconSize?: string;
}

const StyledButton = styled.button<ButtonProps>`
    ${(props) =>
        props.variant === 'disabled' &&
        `
        background-color: ${rgba('#FFFFFF', 0.1)};
        transition: background-color 300ms ease;
        cursor: default;
        &::be{
            display: none;
        }
    `};
    ${(props) =>
        props.variant === 'secondary' &&
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
        props.variant === 'primary' &&
        !props.disabled &&
        `
    background: linear-gradient(260deg, ${props.theme.primaryColor.hex}, ${props.theme.primaryColorGradientEnd.hex});

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${props.theme.primaryColor.hex}, ${props.theme.primaryColorGradientEnd.hex});
    }
  `};

    ${(props) =>
        props.variant === 'custom' &&
        !props.disabled &&
        `
    background: linear-gradient(260deg, ${props.gradients?.join(', ')});

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${props.gradients?.join(
          ', ',
      )});
    }
  `};

    ${(props) =>
        props.variant === 'warning' &&
        !props.disabled &&
        `
    background-color: ${rgba(props.theme.warningColor.hex, 0.4)};
    transition: background-color 300ms ease;

    &::before {
      background-color: ${rgba(props.theme.warningColor.hex, 0.9)};
    }
`};

    ${(props) =>
        props.variant === 'danger' &&
        !props.disabled &&
        `
      background-color: ${rgba(props.theme.errorColor.hex, 0.4)};
      transition: background-color 300ms ease;

      &::before {
        background-color: ${rgba(props.theme.errorColor.hex, 0.9)};
      }
  `};

    outline: none;
    align-items: center;
    border-radius: ${(props) => props.theme.defaultRadius};
    color: ${(props) => (props.variant === 'disabled' ? rgba('#FFFFFF', 0.4) : rgba('#FFFFFF', 0.9))};
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

    & > span:first-child {
        display: flex;
        justify-content: center;
        padding-top: 1px;
        position: relative;
    }
`;

const loaderRotation = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

const BtnIcon = styled(Icon)<{ loading: boolean }>`
    position: absolute;
    right: 20px;
    ${props => props.loading &&
        `animation: ${loaderRotation} 1s linear infinite;`
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
                disabled={props.variant === 'disabled'}
                {...props}
            >
                <span>{props.title}</span>
                {props.loadingState || props.icon ?
                  <BtnIcon
                    loading={props.loadingState}
                    icon={props.loadingState ? 'loader' : props.icon}
                    size={props.iconSize || '20px'}
                    color={'rgba(255,255,255,0.9)'}/> :
                  null}
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
