import * as React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import styled from '../../../config/styled';
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";
import es from "date-fns/locale/es";
import it from "date-fns/locale/it";

registerLocale('es', es);
registerLocale('fr', fr);
registerLocale('it', it);

export interface CustomDatePickerProps extends React.ComponentProps<any> {
  dateFormat: string;
  label: string;
  locale?:string;
  minDate?: Date;
  onChange: (date: Date) => void;
  onChangeRaw?: (e: React.FocusEvent<HTMLInputElement>) => void;
  open?: boolean;
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
    background-color: ${props => props.theme.componentColorLight};
    border: none;
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.fontStack};

    &__navigation {
      background: url('assets/icons/icon--arrow.svg') center/cover no-repeat;
      border: none;
      height: 16px;
      right: ${props => props.theme.biggerSpacing};
      top: ${props => props.theme.biggerSpacing};
      width: 16px;

      &--previous {
        left: auto;
        right: 3.5rem;
        transform: rotate(180deg);
      }
    }

    &__triangle {
      display: none;
    }

    &__current-month {
      color: ${props => props.theme.textColor};
      font-size: 20px;
      padding-left: 14px;
    }

    &__day-names {
      display: flex;
    }

    &__month {
      margin: 0 12px;
    }

    &__day-name,
    &__day {
      align-items: center;
      background-color: transparent;
      border-radius: ${props => props.theme.defaultRadius};
      color: ${props => props.theme.textColor};
      display: inline-flex;
      font-size: 14px;
      font-weight: 500;
      justify-content: center;
      height: 40px;
      line-height: 1em;
      text-align: auto;
      transition: background-color 300ms ease;
      width: 40px;

      &--outside-month,
      &--disabled {
        color: ${props => props.theme.textColorDarker};
      }

      &--selected {
        background: linear-gradient(265deg, ${props => props.theme.primaryColor}, ${props => props.theme.primaryColorGradientEnd});
      }

      &--today {
        background-color: ${props => props.theme.componentColor};
        border-radius: ${props => props.theme.defaultRadius};
      }
    }

    &__day {
      &-name {
        color: ${props => props.theme.textColorDarker};
        font-size: 13px;
        height: auto;
        padding: 1rem 0 0.5rem;
      }

      &:hover {
        background-color: ${props => props.theme.componentColor};
        border-radius: ${props => props.theme.defaultRadius};
      }
    }

    &__header {
      background: ${props => props.theme.componentColor};
      border: none;
      border-radius: ${props => props.theme.defaultRadius};
      padding: ${props => props.theme.biggerSpacing} 12px 0;
      text-align: left;
    }

    &-wrapper {
      background: url('assets/icons/icon--calendar.svg') 24px 16px/14px no-repeat;
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
        dateFormat={props.dateFormat}
        locale={props.locale}
        minDate={props.minDate}
        onChange={props.onChange}
        onChangeRaw={props.onChangeRaw}
        open={props.open}
        placeholderText={props.placeholderText}
        selected={props.selected}
      />
  </StyledInputContainer>
};

export default CustomDatePicker;
