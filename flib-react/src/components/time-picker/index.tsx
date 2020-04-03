import * as React from 'react';
import DatePicker from 'react-datepicker';
import styled from '../../../config/styled';
import "react-datepicker/dist/react-datepicker.css";

export interface CustomTimePickerProps extends React.ComponentProps<any> {
  dateFormat?: string;
  label: string;
  onChange: (date: Date) => void;
  onChangeRaw?: (e: React.FocusEvent<HTMLInputElement>) => void;
  open?: boolean;
  placeholder?: string;
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

    .react-datepicker-wrapper::after {
      transform: rotate(0deg);
    }

    ${StyledLabel} {
      transform: translateX(0px);

      &::before {
        opacity: 1;
      }
    }
  }

  .react-datepicker {
    background-color: ${props => props.theme.componentColorLight};
    border: none;
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.fontStack};

    &__header,
    &__triangle {
      display: none;
    }

    &__time {
      background-color: ${props => props.theme.componentColor};

      &-container {
        width: auto;

        .react-datepicker__time-box {
          width: auto;

          ul.react-datepicker__time-list li.react-datepicker__time-list-item {
            color: ${props => props.theme.textColorDarker};
            font-size: 1rem;
            font-weight: 500;
            height: auto;
            padding: 14px ${props => props.theme.biggerSpacing} 12px;

            &:hover,
            &--selected {
              background-color: ${props => props.theme.componentColor};
              color: ${props => props.theme.textColor};
            }
          }
        }
      }
    }

    &-wrapper {
      background: url('assets/icons/icon--clock.svg') 24px 17px/14px no-repeat;
      padding-left: 24px;
      position: relative;

      &::after {
        background: url('assets/icons/icon--chevron.svg') center/cover no-repeat;
        bottom: ${props => props.theme.biggerSpacing};
        content: "";
        display: block;
        height: 7px;
        position: absolute;
        right: ${props => props.theme.biggerSpacing};
        transform: rotate(-180deg);
        transition: transform 300ms ease;
        width: 12px;
      }

      input{
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
`;

export const CustomTimePicker: React.FunctionComponent<CustomTimePickerProps> = (props: CustomTimePickerProps): JSX.Element => {
  return <StyledInputContainer>
      <StyledLabel>{props.label}</StyledLabel>
      <DatePicker
        dateFormat={props.dateFormat}
        onChange={props.onChange}
        onChangeRaw={props.onChangeRaw}
        placeholderText={props.placeholder}
        selected={props.selected}
        showTimeSelect
        showTimeSelectOnly
      />
  </StyledInputContainer>
};

export default CustomTimePicker;
