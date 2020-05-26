import * as React      from 'react';
import CreatableSelect from 'react-select/creatable';
import styled          from '../../config/styled';
import { ChangeEvent } from 'react';

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
    alignItems: 'flex-start',
    background: 'url(assets/icons/icon--tag.svg) 24px 16px/16px no-repeat',
    display: 'flex',
    paddingBottom: 4,
    paddingLeft: 60,
    paddingRight: 24,
    paddingTop: 2,

    '& > div': {
      flexWrap: 'wrap'
    }
  }),
  indicatorSeparator: () => ({
    border: 'none'
  }),
  input: () => ({
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 12,
    paddingTop: 12
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
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 12,
    paddingTop: 12,
    position: 'absolute' as 'absolute',
  }),
  valueContainer: () => ({
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    padding: 0
  }),
  singleValue: () => ({
    color: 'red'
  }),
  multiValue: () => ({
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'inline-flex',
    fontWeight: 500,
    marginRight: 8,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 14,

    '> div': {
      borderRadius: 0,
      color: '#fff',
      fontSize: 13,
      lineHeight: '1em',
      marginRight: 8,
      overflow: 'visible',
      padding: 0,

      '&:last-of-type:hover': {
        backgroundColor: 'transparent',
        color: '#FFF'
      }
    }
  })
}

export interface ITag {
  label: string;
  value: string;
}

export interface TagsProps extends React.ComponentProps<any> {
  defaultValue?:object;
  error?:string;
  inputValue:string;
  name:string;
  label:string;
  currentTagsNumber?:number;
  maxTags?:number;
  placeholder: string;
  value?:Array<ITag>;
  onInputChange: (inputValue: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>, value: string ) => void;
  onChange: (value: any, event: any) => void;
  onFocus?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
  onBlur: (value: any) => void;
}

const Error = styled.span`
  bottom: -24px;
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

const StyledInputContainer = styled.div<TagsProps>`
  position: relative;
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-direction: column;
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

const LabelsContainer = styled.div`
  color: ${props => props.theme.textColorDarker};
  display: flex;
  font-size: 11px;
  font-weight: 700;
  justify-content: space-between;
  padding: 0 ${props => props.theme.biggerSpacing};
`;

const TagsContainer = styled.div`
  margin: 1rem 0 1rem -2.2rem;
`;

export const Tags: React.FunctionComponent<TagsProps> = (props: TagsProps): JSX.Element => {
  return  <StyledInputContainer error={props.error}>
      <LabelsContainer>
          <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
          {props.maxTags &&
              <span>{props.currentTagsNumber}/{props.maxTags}</span>
          }
      </LabelsContainer>
      <TagsContainer>
        <CreatableSelect
          id={props.name}
          components={components}
          onChange={(v, e)=> {
            props.onChange(v, e);
          }}
          onKeyDown={e => {
            const target = e.target as HTMLInputElement;
            props.onKeyDown(e, target.value)
          }}
          onInputChange={e => {
            props.onInputChange(e);
          }}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
          defaultValue={props.defaultValue}
          inputValue={props.inputValue}
          menuIsOpen={false}
          isClearable={false}
          isMulti
          placeholder={props.placeholder}
          styles={customStyles}
          value={props.value}
        />
      </TagsContainer>
      {props.error && <Error>{props.errormessage}</Error> }
  </StyledInputContainer>
};

export default Tags;
