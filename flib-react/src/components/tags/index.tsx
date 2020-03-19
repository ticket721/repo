import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import styled from '../../../config/styled';

const components = {
  DropdownIndicator: null,
};

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
    paddingBottom: 4,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 2
  }),
  indicatorSeparator: () => ({
    border: 'none'
  }),
  input: () => ({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  menu: () => ({
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    marginTop: 8
  }),
  menuList: () => ({
    maxHeight: 300,
    overflow: 'auto',
    padding: 0,
  }),
  placeholder: () => ({
    color: 'rgba(255, 255, 255, 0.38)',
    fontSize: '14px',
    fontWeight: 500
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
}

export interface TagsProps extends React.ComponentProps<any> {
  defaultValue?:object;
  error?:boolean;
  errorMessage?:string;
  inputValue:string;
  label:string;
  placeholder: string;
  value?:Array<object>;
  onInputChange: (inputValue: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, value: string ) => void;
  onChange: (value: any) => void;
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

const StyledInputContainer = styled.div<TagsProps>`
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

    ${StyledLabel} {
      transform: translateX(0px);

      &::before {
        opacity: 1;
      }
    }
  }
`;

export const Tags: React.FunctionComponent<TagsProps> = (props: TagsProps): JSX.Element => {
  return  <StyledInputContainer>
            <StyledLabel>{props.label}</StyledLabel>
            <CreatableSelect
              components={components}
              onChange={e => {
                props.onChange(e);
              }}
              onKeyDown={e => {
                const target = e.target as HTMLInputElement;
                props.onKeyDown(e, target.value)
              }}
              onInputChange={e => {
                props.onInputChange(e);
              }}
              defaultValue={props.defaultValue}
              inputValue={props.inputValue}
              isClearable
              menuIsOpen={false}
              isMulti
              placeholder={props.placeholder}
              styles={customStyles}
              value={props.value}
            />
          </StyledInputContainer>

}

Tags.defaultProps = {
  onKeyDown: () => {},
  onInputChange: () => {},
  onChange: () => {}
}

export default Tags;
