import * as React from 'react';

import Cleave          from 'cleave.js/react';
import styled          from '../../../config/styled';
import { ChangeEvent } from 'react';

export interface InputProps extends React.ComponentProps<any> {
  error?:string;
  label:string;
  name:string;
  onChange: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
  onFocus?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
  onBlur?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
  placeholder: string;
  options?: any;
  value?:string | number;
  className?: string;
  type?: string | undefined;
}

const Error = styled.span`
  top: 110%;
  color: ${props => props.theme.errorColor.hex};
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
    background-color: ${ props => props.theme.primaryColor.hex};
    border-radius: 100%;
    content: "";
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

const StyledInputContainer = styled.div<InputProps>`
  position: relative;
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: ${props => props.theme.biggerSpacing};
  transition: background-color 300ms ease;

  ${props => props.error &&`
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
    background-color: ${props => props.theme.componentColorLight};
  }

  &:focus-within {
    background-color: ${props => props.theme.componentColorLighter};

    ${StyledLabel} {
      transform: translateX(0px);

      &::before {
        opacity: 1;
      }
    }
  }
`;

export const TextInput: React.FunctionComponent<InputProps & {className?: string}> = (props: InputProps): JSX.Element => {

  return <StyledInputContainer error={props.error} className={props.className}>
      <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>

      {props.options ? (
        <Cleave
        options={props.options}
        id={props.name}
        name={props.name}
        placeholder={props.placeholder}
        defaultValue={props.value}
        onChange={props.onChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        />
      ) : (
        <input
        id={props.name}
        name={props.name}
        placeholder={props.placeholder}
        onFocus={props.onFocus}
        value={props.value}
        type={props.type || 'text'}
        onChange={props.onChange}
        onBlur={props.onBlur}
        />
      )}

      {props.error && <Error>{props.error}</Error> }
  </StyledInputContainer>
};

export default TextInput;
