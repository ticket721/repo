import React                  from 'react';
import {
    Button,
    CustomDatePicker,
    CustomTimePicker,
    TextInput
}                             from '@frontend/flib-react/lib/components';
import styled                 from 'styled-components';
import { useFormik }          from 'formik';
import { DateItem }           from './index';
import { dateItemValidation } from './validationSchema';
import { checkFormatDate }    from '@frontend/core/lib/utils/date';

export interface DateFormProps {
    initialValues: DateItem;
    cancel: () => void;
    confirm: (dateItem: DateItem) => void;
    newDate?: boolean;
    delete?: () => void;
}

export const DateForm: React.FC<DateFormProps> = (props: DateFormProps) => {
    const { newDate, initialValues } = props;
    const checkedInitialValues = {
        ...initialValues,
        eventBegin: checkFormatDate(initialValues.eventBegin),
        eventEnd: checkFormatDate(initialValues.eventEnd),
    };

    const dateItemFormik = useFormik({
        initialValues: checkedInitialValues,
        validationSchema: dateItemValidation,
        onSubmit: (dateItem: DateItem) => props.confirm(dateItem),
    });

    const onDateChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
        if (date.getTime() < Date.now()) {
            return;
        }

        const unchangedTime: number[] = [
            dateItemFormik.values[dateType].getHours(),
            dateItemFormik.values[dateType].getMinutes(),
        ];

        dateItemFormik.setFieldValue(dateType, new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            ...unchangedTime
        ));

        if (dateType === 'eventBegin') {
            if (date.getTime() > dateItemFormik.values.eventEnd.getTime()) {
                dateItemFormik.setFieldValue('eventEnd', new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    ...unchangedTime
                ));
            }
        }
    };

    const onTimeChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
        if (date.getTime() < Date.now()) {
            return;
        }

        const unchangedDate: number[] = [
            dateItemFormik.values[dateType].getFullYear(),
            dateItemFormik.values[dateType].getMonth(),
            dateItemFormik.values[dateType].getDate()
        ];

        dateItemFormik.setFieldValue(dateType, new Date(
            unchangedDate[0],
            unchangedDate[1],
            unchangedDate[2],
            date.getHours(),
            date.getMinutes()
        ));
    };

    const onLocationChange = (location: string) => {
        dateItemFormik.setFieldValue('location', {
            lon: 0,
            lat: 0,
            label: location,
        });
    };

    const computeError = (field: string, nestedField?: string): string => {
        if (nestedField) {
            return dateItemFormik.touched[field] && dateItemFormik.errors[field][nestedField] ?
                dateItemFormik.errors[field] :
                undefined;
        }

        return dateItemFormik.touched[field] && dateItemFormik.errors[field] ?
            dateItemFormik.errors[field] :
            undefined;
    };

    return (
        <Form onSubmit={dateItemFormik.handleSubmit}>
            <TextInput
            className={'date-line-field'}
            label='Name'
            placeholder='Provide a name'
            {...dateItemFormik.getFieldProps('name')}
            error={computeError('name')} />
            <div className={'date-line-field date-container'}>
                <CustomDatePicker
                label={'Event Start'}
                name={'startDate'}
                dateFormat={'iii, MMM do, yyyy'}
                placeholder={'Pick a start date'}
                minDate={new Date()}
                selected={dateItemFormik.values.eventBegin}
                onChange={(date: Date) => onDateChange('eventBegin', date)}
                error={computeError('eventBegin')}/>
                <CustomTimePicker
                label={'Start Time'}
                name={'startTime'}
                dateFormat={'hh:mm aa'}
                placeholder={'Pick a start time'}
                selected={dateItemFormik.values.eventBegin}
                onChange={(date: Date) => onTimeChange('eventBegin', date)}
                error={computeError('eventBegin')}/>
            </div>
            <DateEndContainer
            className={'date-line-field date-container'}
            disabled={!dateItemFormik.values.eventBegin}>
                <CustomDatePicker
                disabled={!dateItemFormik.values.eventBegin}
                label={'Event End'}
                name={'endDate'}
                dateFormat={'iii, MMM do, yyyy'}
                placeholder={'Pick a end date'}
                minDate={dateItemFormik.values.eventBegin}
                selected={dateItemFormik.values.eventEnd}
                onChange={(date: Date) => onDateChange('eventEnd', date)}
                error={computeError('eventEnd')}/>
                <CustomTimePicker
                disabled={!dateItemFormik.values.eventBegin}
                label={'End Time'}
                name={'endTime'}
                dateFormat={'hh:mm aa'}
                placeholder={'Pick a end time'}
                minTime={dateItemFormik.values.eventBegin}
                selected={dateItemFormik.values.eventEnd}
                onChange={(date: Date) => onTimeChange('eventEnd', date)}
                error={computeError('eventEnd')}/>
            </DateEndContainer>
            <TextInput
            className={'date-line-field'}
            label='Location'
            name='location'
            icon={'pin'}
            placeholder='Provide a location'
            value={dateItemFormik.values.location.label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange(e.target.value)}
            error={computeError('location', 'label')} />
            <ButtonsContainer>
                {
                    !newDate ?
                        <Button
                        title='Delete this date'
                        variant={'danger'}
                        onClick={props.delete}
                        /> :
                        <div/>
                }
                <div className={'sub-container'}>
                    <Button
                    title='Cancel'
                    variant={'secondary'}
                    onClick={newDate ? props.delete : props.cancel}
                    />
                    <Button
                    type='submit'
                    title='Confirm Date'
                    variant={
                        dateItemFormik.isValid &&
                        JSON.stringify(dateItemFormik.values) !== JSON.stringify(checkedInitialValues) ?
                            'primary' :
                            'disabled'
                    }
                    />
                </div>
            </ButtonsContainer>
        </Form>
    )
};

const Form = styled.form`
    & > .date-line-field {
        margin-bottom: ${props => props.theme.biggerSpacing};
    }

    & > .date-container {
        display: flex;
        justify-content: space-between;

        & > div:first-child {
            width: calc(65% - ${props => props.theme.biggerSpacing});
            margin-right: ${props => props.theme.biggerSpacing};
        }

        & > div:last-child {
            width: 35%;
        }
    }
`;

const DateEndContainer = styled.div<{ disabled: boolean }>`
    opacity: ${props => props.disabled ? '0.3' : '1'};
`;

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: space-between;

    & > button {
        width: 30%;
    }

    .sub-container {
        width: 50%;
        display: flex;

        & > button:first-child {
            flex: 1;
            margin-right: ${props => props.theme.regularSpacing};
        }

        & > button:last-child {
            flex: 2;
        }
    }
`;
