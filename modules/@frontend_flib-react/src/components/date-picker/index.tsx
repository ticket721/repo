import React, { useContext } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import es from 'date-fns/locale/es';
import it from 'date-fns/locale/it';
import { TextInput } from '../inputs/text';
import styled, { ThemeContext } from 'styled-components';
import { format } from '@frontend/core/lib/utils/date';

registerLocale('es', es);
registerLocale('fr', fr);
registerLocale('it', it);

export interface CustomDatePickerProps extends React.ComponentProps<any> {
    dateFormat?: string;
    label: string;
    name: string;
    locale?: string;
    minDate?: Date;
    maxDate?: Date;
    onChange: (date: Date) => void;
    onChangeRaw?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    open?: boolean;
    placeholder?: string;
    value: Date;
    error?: string;
    selectsStart?: boolean;
    selectsEnd?: boolean;
    showTime?: boolean;
    timeInputLabel?: string;
    startDate?: Date;
    endDate?: Date;
    disabled?: boolean;
    gradients?: string[];
}

export const CustomDatePicker: React.FunctionComponent<CustomDatePickerProps> = (
    props: CustomDatePickerProps,
): JSX.Element => {
    const themeCtx = useContext(ThemeContext);

    return (
        <DatePickerWrapper gradients={props.gradients}>
            <TextInput
                value={props.value ? format(props.value) : ''}
                name={props.name}
                onChange={console.log}
                label={props.label}
                icon={'calendar'}
                iconColor={
                    props.error
                        ? themeCtx.errorColor.hex
                        : props.gradients
                        ? props.gradients[0]
                        : themeCtx.primaryColor.hex
                }
                placeholder={props.placeholder}
                error={props.error}
            />
            <DatePicker
                name={props.name}
                dateFormat={props.dateFormat}
                locale={props.locale}
                minDate={props.minDate}
                maxDate={props.maxDate}
                startDate={props.startDate}
                endDate={props.endDate}
                onChange={props.onChange}
                onChangeRaw={
                    props.onChangeRaw
                        ? props.onChangeRaw
                        : (e: any) => {
                              e.preventDefault();
                          }
                }
                onBlur={props.onBlur}
                open={props.open}
                selected={props.value}
                shouldCloseOnSelect={!props.selectsStart && !props.selectsEnd && !props.showTime}
                selectsStart={props.selectsStart}
                selectsEnd={props.selectsEnd}
                showTimeInput={props.showTime}
                timeInputLabel={props.timeInputLabel + ':'}
            />
        </DatePickerWrapper>
    );
};

const DatePickerWrapper = styled.div<{ gradients?: string[] }>`
    position: relative;

    .react-datepicker {
        background-color: #262626;
        border: none;
        color: ${(props) => props.theme.textColor};
        font-family: ${(props) => props.theme.fontStack};

        &-wrapper {
            position: absolute;
            top: 0;
            width: 100%;
            height: 87px;
            opacity: 0;

            > div {
                height: 100%;

                > input {
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
            }
        }

        &__navigation {
            outline: none;
            height: 8px;
            top: 14px;
        }

        &__triangle {
            display: none;
        }

        &__current-month {
            color: ${(props) => props.theme.textColor};
            font-size: 16px;
            text-align: center;
        }

        &__day-names {
            display: flex;
        }

        &__month {
            margin: ${(props) => props.theme.smallSpacing};
        }

        &__week {
            height: 40px;
            display: flex;
            align-items: center;
        }

        &__day-name,
        &__day {
            flex: 1;
            align-items: center;
            background-color: transparent;
            display: inline-flex;
            font-size: 13px;
            font-weight: 500;
            justify-content: center;
            height: 25px;
            line-height: 1em;
            text-align: auto;
            transition: background-color 300ms ease;
            width: 35px;
        }

        &__day {
            color: ${(props) => props.theme.textColor};
            margin: 0;

            &-name {
                color: ${(props) => props.theme.textColorDarker};
                height: auto;
                padding: 1rem 0 0.5rem;
            }

            &--in-range {
                border-radius: 0;
                background-color: ${(props) =>
                    props.gradients ? props.gradients[1] : props.theme.primaryColorGradientEnd.hex};
            }

            &--in-selecting-range {
                border-radius: 0;
                background-color: ${(props) =>
                    props.gradients ? props.gradients[1] : props.theme.primaryColorGradientEnd.hex};
            }

            &--selected,
            &--range-start,
            &--range-end,
            &--selecting-range-start,
            &--selecting-range-end {
                height: 40px;
                font-size: 14px;
                font-weight: 600;
                border-radius: ${(props) => props.theme.defaultRadius};
            }

            &--selected {
                background: linear-gradient(
                    265deg,
                    ${(props) => (props.gradients ? props.gradients[0] : props.theme.primaryColor.hex)},
                    ${(props) => (props.gradients ? props.gradients[1] : props.theme.primaryColorGradientEnd.hex)}
                );
            }

            &--range-start {
                background: linear-gradient(
                    90deg,
                    ${(props) => (props.gradients ? props.gradients[0] : props.theme.primaryColor.hex)},
                    ${(props) => (props.gradients ? props.gradients[1] : props.theme.primaryColorGradientEnd.hex)}
                );
            }

            &--range-end {
                background: linear-gradient(
                    270deg,
                    ${(props) => (props.gradients ? props.gradients[0] : props.theme.primaryColor.hex)},
                    ${(props) => (props.gradients ? props.gradients[1] : props.theme.primaryColorGradientEnd.hex)}
                );
            }

            &--today {
                background-color: ${(props) => props.theme.componentColor};
                border-radius: ${(props) => props.theme.defaultRadius};
            }

            &--outside-month,
            &--disabled {
                color: ${(props) => props.theme.textColorDarker};
            }

            &:hover {
                background-color: ${(props) => props.theme.componentColor};
                border-radius: ${(props) => props.theme.defaultRadius};
            }

            &:focus {
                outline: 0;
            }
        }

        &__header {
            background: ${(props) => props.theme.componentColor};
            border: none;
            border-radius: ${(props) => props.theme.defaultRadius};
            padding: ${(props) => props.theme.regularSpacing} 12px 0;
            text-align: left;
        }

        &__input-time-container {
            width: inherit;
            margin: 0 ${(props) => props.theme.regularSpacing} ${(props) => props.theme.smallSpacing};
        }

        &-time__input {
            & > input {
                width: inherit;
                padding: ${(props) => props.theme.smallSpacing};
                border-radius: ${(props) => props.theme.defaultRadius};
                background-color: ${(props) => props.theme.componentColorLight};
                text-align: center;

                &::-webkit-calendar-picker-indicator {
                    display: none;
                }
            }
        }
    }
`;

export default CustomDatePicker;
