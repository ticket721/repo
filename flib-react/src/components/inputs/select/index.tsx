import * as React from 'react';
import Select from 'react-select';
import styled from '../../../config/styled';

const customStyles = {
  option: () => ({
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 12,
    transition: 'all 300ms ease',

    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: 'rgba(255, 255, 255, 0.9)'
    }
  }),
  control: () => ({
    display: 'flex',
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 16
  }),
  indicatorsContainer: () => ({
    display: 'flex',
    position: 'relative' as 'relative',

    '& > div': {
      padding: 0
    }
  }),
  indicatorSeparator: () => ({
    border: 'none'
  }),
  input: () => ({
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14
  }),
  menu: () => ({
    backgroundColor: '#262331',
    borderRadius: 8,
    marginTop: 8,
    position: 'absolute' as 'absolute',
    width: '100%'
  }),
  menuList: () => ({
    maxHeight: 300,
    overflow: 'auto',
    padding: 0,
  }),
  noOptionsMessage: () => ({
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 12,
  }),
  placeholder: () => ({
    color: 'rgba(255, 255, 255, 0.38)',
    fontSize: '14px',
    fontWeight: 500,
    position: 'absolute' as 'absolute'
  }),
  valueContainer: () => ({
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    padding: 0
  }),
  singleValue: () => ({
    fontSize: 14,
    fontWeight: 500,
    marginRight: 8,
    opacity: 0.9
  })
};

export interface SelectProps extends React.ComponentProps<any> {
  defaultValue?:object;
  error?:boolean;
  errorMessage?:string;
  label?:string;
  options: Array<object>,
  placeholder?: string;
  searchable?:boolean;
  value?:string;
}

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
  padding-top: ${props => props.label ? props.theme.biggerSpacing : 0};
  transition: background-color 300ms ease;

  [class*="dummyInput"] {
    display: none;
  }

  ${props => !props.label &&`
    [class*="Control"] {
      padding: 10px 9px 8.5px 12px;
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

export const SelectInput: React.FunctionComponent<SelectProps> = (props: SelectProps): JSX.Element => {
  return  <StyledInputContainer label={props.label}>
            {props.label &&
              <StyledLabel>{props.label}</StyledLabel>
            }
            <Select
              defaultValue={props.defaultValue}
              noOptionsMessage={() => "No values available"}
              options={props.options}
              placeholder={props.placeholder}
              isSearchable={props.searchable}
              styles={customStyles}
            />
          </StyledInputContainer>

}

export default SelectInput;
