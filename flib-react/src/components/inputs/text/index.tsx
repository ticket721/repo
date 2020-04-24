import * as React from 'react';
import styled from '../../../config/styled';
import Cleave from 'cleave.js/react';

export interface InputProps extends React.ComponentProps<any> {
  error?:boolean;
  errorMessage?:string;
  label:string;
  name:string;
  onChange: () => void;
  placeholder: string;
  options?: any;
  value?:string;
}

const Error = styled.span`
  bottom: -24px;
  color: ${props => props.theme.warningColor};
  font-size: 13px;
  font-weight: 500;
  left: 0;
  position: absolute;
`;

const StyledLabel = styled.label`
  display: inline-flex;
  transform: translateX(-12px);
  transition: all 300ms ease;

  &::before {
    background-color: ${ props => props.theme.primaryColor};
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
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-direction: column;
  padding-top: ${props => props.theme.biggerSpacing};
  transition: background-color 300ms ease;

  ${props => props.error &&`
    ${StyledLabel}{
      color: ${props.theme.warningColor};
      transform: translateX(0px);

      &::before {
        background-color: ${props.theme.warningColor};
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
        <Cleave options={props.options} id={props.name} name={props.name} placeholder={props.placeholder} defaultValue={props.value} onChange={props.onChange} />
      ) : (
        <input id={props.name} name={props.name} placeholder={props.placeholder} defaultValue={props.value} onChange={props.onChange} />
      )}

      {props.error && <Error>{ props.errorMessage }</Error> }
  </StyledInputContainer>
}

export default TextInput;
