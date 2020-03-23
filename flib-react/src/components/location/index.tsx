import * as React from 'react';
import Select from 'react-select';
import styled from '../../../config/styled';

const components = {
  DropdownIndicator: null,
};
const customStyles = {
  option: () => ({
    background: 'transparent url(assets/icons/icon--location-gray.svg) 24px center/12px 16px no-repeat',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 12,
    paddingLeft: 48,
    paddingRight: 24,
    paddingTop: 12,
    transition: 'all 300ms ease',

    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: 'rgba(255, 255, 255, 0.9)'
    }
  }),
  control: () => ({
    background: 'url(assets/icons/icon--location.svg) 24px 17px/12px 16px no-repeat',
    display: 'flex',
    paddingBottom: 24,
    paddingLeft: 48,
    paddingRight: 24,
    paddingTop: 16
  }),
  indicatorSeparator: () => ({
    border: 'none'
  }),
  input: () => ({
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14
  }),
  menu: () => ({
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
    opacity: 0.9
  })
};

export interface LocationProps extends React.ComponentProps<any> {
  defaultValue?:object;
  error?:boolean;
  errorMessage?:string;
  label:string;
  options: Array<object>,
  placeholder: string;
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

const StyledInputContainer = styled.div<LocationProps>`
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
export const Location: React.FunctionComponent<LocationProps> = (props: LocationProps): JSX.Element => {
  return  <StyledInputContainer>
    <StyledLabel>{props.label}</StyledLabel>
    <Select
      components={components}
      defaultValue={props.defaultValue}
      dropdownIndicator={false}
      isClearable
      noOptionsMessage={() => "No values available"}
      options={props.options}
      placeholder={props.placeholder}
      styles={customStyles}
    />
  </StyledInputContainer>
};

export default Location;
