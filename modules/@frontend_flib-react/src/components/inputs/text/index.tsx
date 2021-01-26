import * as React from 'react';

import Cleave from 'cleave.js/react';
import styled from '../../../config/styled';
import { ChangeEvent } from 'react';
import Icon, { IconColor } from '../../icon';

export interface TextInputProps extends React.ComponentProps<any> {
    error?: string;
    label: string;
    accept?: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<any>) => void;
    onFocus?: (
        eventOrPath: string | ChangeEvent<any>,
    ) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
    onBlur?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
    placeholder?: string;
    options?: any;
    defaultValue?: string | number;
    value?: string | number;
    className?: string;
    type?: string | undefined;
    icon?: string;
    iconColor?: IconColor;
    minimum?: number;
    autoComplete?: string;
    pattern?: string;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    disabled?: boolean;
}

const Error = styled.span`
    top: 104%;
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
    font-weight: 500;
    left: 10px;
    position: absolute;
`;

const StyledLabel = styled.label`
    display: inline-flex;
    transform: translateX(-12px);
    transition: all 300ms ease;

    &::before {
        background-color: ${(props) => props.theme.primaryColor.hex};
        border-radius: 100%;
        content: '';
        display: inline-block;
        height: 4px;
        margin-right: 8px;
        opacity: 0;
        position: relative;
        top: 2px;
        transition: opacity 300ms ease;
        width: 4px;
    }
`;

const StyledInputContainer = styled.div<TextInputProps>`
    position: relative;
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;

    ${(props) =>
        props.disabled
            ? `
        opacity: 0.3;
        filter: grayscale(1);
    `
            : null};

    ${(props) =>
        props.error &&
        `
    ${StyledLabel}{
      color: ${props.theme.errorColor.hex};
      transform: translateX(0px);

      &::before {
        background-color: ${props.theme.errorColor.hex};
        opacity: 1;
      }
    }
  `}

    &:hover {
        background-color: ${(props) => props.theme.componentColorLight};
    }

    &:focus-within {
        background-color: ${(props) => props.theme.componentColorLighter};

        ${StyledLabel} {
            transform: translateX(0px);

            &::before {
                opacity: 1;
            }
        }
    }

    .sub-container {
        display: flex;
        align-items: center;
        padding-left: 1.5rem;

        & > span {
            margin-right: 0.7rem;
            margin-bottom: 5px;
        }

        & > :not(span) {
            width: 100%;
            padding: 1rem 1.5rem 1rem 0;
        }
    }
`;

export const TextInput: React.FunctionComponent<TextInputProps & { className?: string }> = (
    props: TextInputProps,
): JSX.Element => {
    return (
        <StyledInputContainer error={props.error} className={props.className} disabled={props.disabled}>
            <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
            <div className={'sub-container'}>
                {props.icon ? <Icon icon={props.icon} size={'16px'} color={props.iconColor} /> : null}
                {props.options ? (
                    <Cleave
                        options={props.options}
                        id={props.name}
                        name={props.name}
                        placeholder={props.placeholder}
                        defaultValue={props.defaultValue}
                        value={props.value}
                        onChange={props.onChange}
                        onFocus={props.onFocus}
                        onBlur={props.onBlur}
                        type={props.type || 'text'}
                        autoComplete={props.autoComplete || 'off'}
                        pattern={props.pattern}
                        inputMode={props.inputMode}
                        disabled={props.disabled}
                    />
                ) : (
                    <input
                        accept={'.csv'}
                        autoComplete={props.autoComplete || 'off'}
                        id={props.name}
                        name={props.name}
                        min={props.minimum}
                        placeholder={props.placeholder}
                        onFocus={props.onFocus}
                        onKeyDown={props.onKeyDown}
                        defaultValue={props.defaultValue}
                        value={props.value}
                        step={'.01'}
                        type={props.type || 'text'}
                        onChange={props.onChange}
                        onBlur={props.onBlur}
                        pattern={props.pattern}
                        inputMode={props.inputMode}
                        disabled={props.disabled}
                    />
                )}
            </div>
            {props.error && <Error>{props.error}</Error>}
        </StyledInputContainer>
    );
};

export default TextInput;
