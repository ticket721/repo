import * as React from 'react';
import styled from '../../../config/styled';

export interface ToggleProps extends React.ComponentProps<any> {
  label: string;
  name:string;
  description?: string;
  onChange: (checked: boolean, id: string, e: React.ChangeEvent<HTMLElement> ) => void;
  gradient?: string[];
}

const StyledLabel = styled.label`
  color: ${props => props.theme.textColor};
  cursor: pointer;
  display: inline-flex;
  flex: 1;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 700;
  line-height: 150%;
  padding: 0 64px 0 0;
  position: relative;
  text-transform: none;

  p {
    color: ${props  => props.theme.textColorDark};
    font-size: 14px;
    font-weight: 500;
    padding-top: 0.5rem;
    width: 100%;
  }
`;

const ToggleSwitch = styled.span`
  align-items: center;
  background-color: ${props => props.theme.componentColorLighter};
  border-radius: ${props => props.theme.defaultRadius};
  content: "";
  display: inline-flex;
  height: 24px;
  justify-content: center;
  left: 0;
  position: absolute;
  transform: translateX(0%);
  transition: transform 300ms ease;
  top: 0;
  width: 24px;

  &::after {
    border-bottom: 2px solid #FFF;
    border-right: 2px solid #FFF;
    content: "";
    display: block;
    height: 10px;
    position: relative;
    opacity: 0;
    top: -2px;
    transform: rotate(45deg);
    transition: opacity 300ms ease;
    width: 5px;
  }
`;

const ToggleSwitchContainer = styled.div`
  background-color: ${props => props.theme.componentColorLight};
  border-radius: ${props => props.theme.defaultRadius};
  content: "";
  display: block;
  height: 24px;
  padding-left: ${props => props.theme.doubleSpacing};
  position: absolute;
  right: 0;
  top: 0;
  width: 44px;
`;

const StyledCheckboxContainer = styled.div<ToggleProps>`
  color: ${props => props.theme.textColorDark};
  display: flex;
  margin-bottom: ${props => props.theme.biggerSpacing};
  width: 100%;

  &:last-of-type {
    margin-bottom: 0;
  }

  input:checked {
    & ~ ${ToggleSwitchContainer} {
      ${ToggleSwitch} {
        background: linear-gradient(260deg, ${props => props.gradient?.join(', ')});
        transform: translateX(100%);

        &::after {
          opacity: 1;
        }
      }
    }
  }
`;


export const Toggle: React.FunctionComponent<ToggleProps & {className ?: string}> = (props: ToggleProps): JSX.Element => {

  return <StyledCheckboxContainer gradient={props.gradient}>
      <StyledLabel htmlFor={props.name}>{props.label}
        <input
          type="checkbox"
          name={props.name}
          id={props.name}
          onChange={e => {
            props.onChange(e.target.checked, props.name, e);
          }}
        />
        <ToggleSwitchContainer>
          <ToggleSwitch />
        </ToggleSwitchContainer>
        {props.description &&
          <p>{props.description}</p>
        }
      </StyledLabel>
    </StyledCheckboxContainer>;
};


Toggle.defaultProps = {
  onChange: () => {},
  gradient: ['#079CF0', '#2143AB']
};

export default Toggle;
