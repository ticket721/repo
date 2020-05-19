import * as React      from 'react';
import styled          from '../../../config/styled';
import { ChangeEvent } from 'react';

export interface TextareaProps extends React.ComponentProps<any> {
  error?:string;
  label:string;
  maxChar?: number;
  name:string;
  placeholder: string;
  value?:string;
  className?: string;
  onChange: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
  onFocus?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
  onBlur?: (eventOrPath: string | ChangeEvent<any>) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
}

const Error = styled.span`
  bottom: -16px;
  color: ${props => props.theme.warningColor};
  font-size: 13px;
  font-weight: 500;
  left: 10px;
  position: absolute;
`;

const StyledLabel = styled.label`
  display: inline-flex;
  padding: 0;
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

const StyledTextarea = styled.div<TextareaProps>`
  position: relative;
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  display: flex;
  flex-direction: column;
  padding-top: ${props => props.theme.biggerSpacing};
  transition: background-color 300ms ease;

  textarea {
    resize: vertical;
  }

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

const LabelsContainer = styled.div`
  color: ${props => props.theme.textColorDarker};
  display: flex;
  font-size: 11px;
  font-weight: 700;
  justify-content: space-between;
  padding: 0 ${props => props.theme.biggerSpacing};
`;

export const Textarea: React.FunctionComponent<TextareaProps> = (props: TextareaProps): JSX.Element => {
  const [count, setCount ] = React.useState(0);

  const keypress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    setCount(target.value.length);
  };

  return <StyledTextarea error={props.error} className={props.className}>
      <LabelsContainer>
        <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
        {props.maxChar &&
          <span>{count}/{props.maxChar}</span>
        }
      </LabelsContainer>

      <textarea
      id={props.name}
      name={props.name}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onKeyUp={keypress}
      maxLength={props.maxChar}
      >
      </textarea>

    {props.error && <Error>{ props.error}</Error> }
  </StyledTextarea>
};

export default Textarea;
