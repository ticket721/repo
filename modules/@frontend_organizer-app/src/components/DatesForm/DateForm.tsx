import React                  from 'react';
import {
    CustomDatePicker,
    CustomTimePicker,
    TextInput
}                             from '@frontend/flib-react/lib/components';
import styled                 from 'styled-components';
import { useFormik }          from 'formik';
import { DateItem }           from './index';
import { dateItemValidation } from './validationSchema';
import { checkFormatDate }               from '@frontend/core/lib/utils/date';
import { FormActions, FormActionsProps } from '../FormActions';

export interface DateFormProps extends FormActionsProps {
    initialValues: DateItem;
    confirm: (date: DateItem) => void;
}

export const DateForm: React.FC<DateFormProps> = (props: DateFormProps) => {
    const { initialValues } = props;
    const checkedInitialValues = {
        ...initialValues,
        eventBegin: checkFormatDate(initialValues.eventBegin),
        eventEnd: checkFormatDate(initialValues.eventEnd),
    };

    const formik = useFormik({
        initialValues: checkedInitialValues,
        validationSchema: dateItemValidation,
        onSubmit: (dateItem: DateItem) => props.confirm(dateItem),
    });

    const onDateChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
        if (date.getTime() < Date.now()) {
            return;
        }

        const unchangedTime: number[] = [
            formik.values[dateType].getHours(),
            formik.values[dateType].getMinutes(),
        ];

        formik.setFieldValue(dateType, new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            ...unchangedTime
        ));

        if (dateType === 'eventBegin') {
            if (date.getTime() > formik.values.eventEnd.getTime()) {
                formik.setFieldValue('eventEnd', new Date(
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
            formik.values[dateType].getFullYear(),
            formik.values[dateType].getMonth(),
            formik.values[dateType].getDate()
        ];

        formik.setFieldValue(dateType, new Date(
            unchangedDate[0],
            unchangedDate[1],
            unchangedDate[2],
            date.getHours(),
            date.getMinutes()
        ));
    };

    const onLocationChange = (location: string) => {
        formik.setFieldValue('location', {
            lon: 0,
            lat: 0,
            label: location,
        });
    };

    const computeError = (field: string, nestedField?: string): string => {
        if (nestedField && formik.errors[field]) {
            return formik.touched[field] && formik.errors[field][nestedField] ?
                formik.errors[field] :
                undefined;
        }

        return formik.touched[field] && formik.errors[field] ?
            formik.errors[field] :
            undefined;
    };

    return (
        <Form onSubmit={formik.handleSubmit}>
            <TextInput
            className={'date-line-field'}
            label='Name'
            placeholder='Provide a name'
            {...formik.getFieldProps('name')}
            error={computeError('name')} />
            <div className={'date-line-field date-container'}>
                <CustomDatePicker
                label={'Event Start'}
                name={'startDate'}
                dateFormat={'iii, MMM do, yyyy'}
                placeholder={'Pick a start date'}
                minDate={new Date()}
                selected={formik.values.eventBegin}
                onChange={(date: Date) => onDateChange('eventBegin', date)}
                error={computeError('eventBegin')}/>
                <CustomTimePicker
                label={'Start Time'}
                name={'startTime'}
                dateFormat={'hh:mm aa'}
                placeholder={'Pick a start time'}
                selected={formik.values.eventBegin}
                onChange={(date: Date) => onTimeChange('eventBegin', date)}
                error={computeError('eventBegin')}/>
            </div>
            <DateEndContainer
            className={'date-line-field date-container'}
            disabled={!formik.values.eventBegin}>
                <CustomDatePicker
                disabled={!formik.values.eventBegin}
                label={'Event End'}
                name={'endDate'}
                dateFormat={'iii, MMM do, yyyy'}
                placeholder={'Pick a end date'}
                minDate={formik.values.eventBegin}
                selected={formik.values.eventEnd}
                onChange={(date: Date) => onDateChange('eventEnd', date)}
                error={computeError('eventEnd')}/>
                <CustomTimePicker
                disabled={!formik.values.eventBegin}
                label={'End Time'}
                name={'endTime'}
                dateFormat={'hh:mm aa'}
                placeholder={'Pick a end time'}
                minTime={formik.values.eventBegin}
                selected={formik.values.eventEnd}
                onChange={(date: Date) => onTimeChange('eventEnd', date)}
                error={computeError('eventEnd')}/>
            </DateEndContainer>
            <TextInput
            className={'date-line-field'}
            label='Location'
            name='location'
            icon={'pin'}
            placeholder='Provide a location'
            value={formik.values.location.label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange(e.target.value)}
            error={computeError('location', 'label')} />
            <FormActions
            delete={props.delete}
            cancel={props.cancel}
            newItem={props.newItem}
            disabled={
                !formik.isValid &&
                JSON.stringify(formik.values) === JSON.stringify(checkedInitialValues)
            }
            />
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
