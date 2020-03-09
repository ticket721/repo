import * as React from 'react';
import Select from 'react-select';
import styled from '../../../../config/styled';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

const customStyles = {
  option: () => ({
    borderBottom: '1px dotted pink',
    color:  'blue',
    padding: 20,
  }),
  control: () => ({
    display: 'flex',
  }),
  indicatorSeparator: () => ({
    border: 'none',
  }),
  placeholder: () => ({
    color: 'rgba(255, 255, 255, 0.38)',
    fontSize: '14px',
  }),
  singleValue: () => {
    const opacity = 1;
    const transition = 'opacity 300ms';

    return { opacity, transition };
  }
}

export interface SelectProps extends React.ComponentProps<any> {
  error?:boolean;
  errorMessage?:string;
  // label:string;
  // name:string;
  // onChange: () => void;
  // placeholder: string;
  value?:string;
}

// const Error = styled.span`
//   bottom: -24px;
//   color: ${props => props.theme.warningColor};
//   font-size: 13px;
//   font-weight: 500;
//   left: 0;
//   position: absolute;
// `;

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

const StyledInputContainer = styled.div<SelectProps>`
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-direction: column;
  padding-top: ${props => props.theme.biggerSpacing};
  transition: background-color 300ms ease;



  &:hover {
    background-color: ${props => props.theme.componentColorLight};
  }

  &:focus-within {
    background-color: ${props => props.theme.componentColorLighter};


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
export const SelectInput: React.FunctionComponent<SelectProps> = (props: SelectProps): JSX.Element => {
  return  <StyledInputContainer>
            <StyledLabel>Label</StyledLabel>
            <Select styles={customStyles} options={options} />
          </StyledInputContainer>

}

export default SelectInput;
