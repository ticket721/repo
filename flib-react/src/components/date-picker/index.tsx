import * as React from 'react';
import DatePicker from 'react-datepicker';
import styled from '../../../config/styled';
import "react-datepicker/dist/react-datepicker.css";

export interface CustomDatePickerProps extends React.ComponentProps<any> {
  label: string;
  onChange: () => void;
  placeholderText?: string;
  selected?: Date;
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

const StyledInputContainer = styled.div`
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

    input{
      &::placeholder {
        color: ${props => props.theme.textColor}
      }
    }

    ${StyledLabel} {
      transform: translateX(0px);

      &::before {
        opacity: 1;
      }
    }
  }

  .react-datepicker {
    font-family: ${props => props.theme.fontStack};

    &__triangle {
      display: none;
    }

    &__header {
      border-bottom-left-radius: ${props => props.theme.defaultRadius};
      border-top-left-radius: ${props => props.theme.defaultRadius};
      padding: ${props => props.theme.biggerSpacing};
    }

    &-wrapper {
      background: url(assets/icons/icon--calendar.svg) 24px 16px/14px no-repeat;
      padding-left: 24px;

      input{
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
`;

export const CustomDatePicker: React.FunctionComponent<CustomDatePickerProps> = (props: CustomDatePickerProps): JSX.Element => {
  return <StyledInputContainer>
      <StyledLabel>{props.label}</StyledLabel>
      <DatePicker
        onChange={props.onChange}
        placeholderText={props.placeholderText}
        open
        selected={props.selected}
      />
  </StyledInputContainer>
};

export default CustomDatePicker;
