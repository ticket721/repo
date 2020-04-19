import * as React from 'react';
import styled from '../../../config/styled';

export interface RadioProps extends React.ComponentProps<any> {
  label: string;
  name:string;
  value: string;
  onChange: (value: string, id: string, e: React.ChangeEvent<HTMLElement> ) => void;
}

const StyledLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
  padding: 0;
  position: relative;
  text-transform: none;
  transition: color 300ms ease;

  &::before {
    background-color: ${props => props.theme.componentColorLight};
    border-radius: 100%;
    content: "";
    display: block;
    height: 1.5rem;
    margin-right: 1rem;
    transition: background-color 300ms ease;
    width: 1.5rem;
  }

  &::after {
    background-color: #FFF;
    border-radius: calc(${props => props.theme.defaultRadius} / 2);
    content: "";
    display: block;
    height: 10px;
    left: 7px;
    opacity: 0;
    position: absolute;
    top: 7px;
    transition: opacity 300ms ease;
    width: 10px;
  }

  &:hover {
    color: ${props => props.theme.textColor};

    &::before {
      background-color: ${props => props.theme.componentColorLighter};
    }
  }
`;

const StyledCheckboxContainer = styled.div`
  color: ${props => props.theme.textColorDark};
  display: flex;
  margin-bottom: ${props => props.theme.regularSpacing};

  &:last-of-type {
    margin: 0;
  }

  input:checked {
    & ~ ${StyledLabel} {
      color: ${props => props.theme.textColor};

      &::before {
        background: linear-gradient(260deg, ${props => props.theme.primaryColor}, ${props => props.theme.primaryColorGradientEnd});
      }

      &::after {
        opacity: 1;
      }
    }
  }
`;


export const Radio: React.FunctionComponent<RadioProps> = (props: RadioProps): JSX.Element => {
  return <StyledCheckboxContainer>
    <input
      type="radio"
      name={props.name}
      id={props.value}
      onChange={e => {
        props.onChange(e.target.value, props.name, e);
      }}
      value={props.value}
    />
    <StyledLabel htmlFor={props.value}>{props.label}</StyledLabel>
  </StyledCheckboxContainer>;
};


Radio.defaultProps = {
  onChange: () => {}
};

export default Radio;
