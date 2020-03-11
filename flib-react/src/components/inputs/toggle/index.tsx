import * as React from 'react';
import styled from '../../../../config/styled';

export interface ToggleProps extends React.ComponentProps<any> {
  label: string;
  defaultChecked?:boolean;
  name:string;
  onChange: (checked: boolean, id: string, e: React.ChangeEvent<HTMLElement> ) => void;
}

const StyledLabel = styled.label`
  cursor: pointer;
  display: inline-flex;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
  padding: 0;
  position: relative;
  text-transform: none;

  &::before {
    background-color: ${props => props.theme.componentColor};
    border-radius: ${props => props.theme.defaultRadius};
    content: "";
    display: block;
    height: 1.5rem;
    margin-right: 1rem;
    transition: background-color 300ms ease;
    width: 1.5rem;
  }

  &::after {
    border-bottom: 2px solid #FFF;
    border-right: 2px solid #FFF;
    content: "";
    display: block;
    height: 10px;
    left: 8px;
    opacity: 0;
    position: absolute;
    top: 4px;
    transform: rotate(45deg);
    transition: opacity 300ms ease;
    width: 5px;
  }

  &:hover {
    &::before {
      background-color: ${props => props.theme.componentColorLighter};
    }
  }
`;

const StyledCheckboxContainer = styled.div`
  color: ${props => props.theme.textColorDark}
  display: flex;

  input:checked {
    & ~ ${StyledLabel} {
      &::before {
        background: linear-gradient(260deg, ${props => props.theme.primaryColor}, ${props => props.theme.primaryColorGradientEnd});
      }

      &::after {
        opacity: 1;
      }
    }
  }
`;


export const Toggle: React.FunctionComponent<ToggleProps> = (props: ToggleProps): JSX.Element => {


  return <StyledCheckboxContainer>
    <input
      type="checkbox"
      name={props.name}
      id={props.name}
      onChange={e => {
        props.onChange(e.target.checked, props.name, e);
      }}
    />
    <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
  </StyledCheckboxContainer>;
};


Toggle.defaultProps = {
  onChange: () => {},
};

export default Toggle;
