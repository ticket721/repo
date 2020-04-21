import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface SearchInputProps extends React.ComponentProps<any> {
  name:string;
  onChange: () => void;
  placeholder: string;
  value?:string;
  mainColor?: string;
}

const InputContainer = styled.div`
  background-color: ${props => props.theme.componentColorLight};
  border-radius: ${props => props.theme.defaultRadius};
  margin: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
  overflow: hidden;
  padding: 0 ${props => props.theme.regularSpacing};
  position: relative;

  input {
    font-size: 15px;
    width: 100%;

    &::placeholder {
      color: ${props => props.theme.textColorDark};
    }
  }
`

const SearchIcon = styled(Icon)`
  position: absolute;
  top: ${props => props.theme.regularSpacing}
`

export const SearchInput: React.FunctionComponent<SearchInputProps> = (props: SearchInputProps): JSX.Element => {
  return <InputContainer>
          <SearchIcon fill={props.mainColor} width="24" height="24" icon="search" />
          <input id={props.name} name={props.name} placeholder={props.placeholder} />
        </InputContainer>
}

SearchInput.defaultProps = {
  mainColor: '#079CF0'
}

export default SearchInput;
