import React from 'react';
import {
    CustomDatePicker,
    CustomTimePicker,
    TextInput
}                           from '@frontend/flib-react/lib/components';
import styled                            from 'styled-components';
import { useFormik }                     from 'formik';
import { DateItem }                      from '../';
import { dateItemValidation }            from '../validationSchema';
import { checkFormatDate, minute, compareDates, TimeScale }       from '@frontend/core/lib/utils/date';
import { FormActions, FormActionsProps } from '../../FormActions';

import { useTranslation }              from 'react-i18next';
import './locales';
import { LocationInput }               from '@frontend/core/lib/components/LocationInput';
import { getLatLng, geocodeByAddress } from 'react-google-places-autocomplete';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                 from 'react-redux';

export interface DateFormProps extends FormActionsProps {
    initialValues: DateItem;
    confirm: (date: DateItem) => void;
}

export const DateForm: React.FC<DateFormProps> = (props: DateFormProps) => {
    const [ t, i18n ] = useTranslation(['date_form', 'vaildation', 'errors']);
    const { initialValues } = props;
    const checkedInitialValues = {
        ...initialValues,
        eventBegin: checkFormatDate(initialValues.eventBegin),
        eventEnd: checkFormatDate(initialValues.eventEnd),
    };

    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: checkedInitialValues,
        validationSchema: dateItemValidation,
        onSubmit: (date) => props.confirm(date),
    });

    const onDateChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
        if (date.getTime() < Date.now()) {
            return;
        }

        const finalDate: Date = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            formik.values[dateType].getHours(),
            formik.values[dateType].getMinutes(),
        );

        formik.setFieldValue(dateType, new Date(finalDate.getTime()));

        if (dateType === 'eventBegin') {
            if (date.getTime() >= formik.values.eventEnd.getTime()) {
                const minTime: Date = new Date();
                minTime.setTime(finalDate.getTime() + 30 * minute);
                formik.setFieldValue('eventEnd', minTime);
            }
        }
    };

    const onTimeChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
        if (date.getTime() < Date.now()) {
            return;
        }

        const finalDate: Date = new Date(
            formik.values[dateType].getFullYear(),
            formik.values[dateType].getMonth(),
            formik.values[dateType].getDate(),
            date.getHours(),
            date.getMinutes()
        );
        formik.setFieldValue(dateType, new Date(finalDate.getTime()));

        if (dateType === 'eventBegin') {
            if (date.getTime() >= formik.values.eventEnd.getTime()) {
                const minTime: Date = new Date();
                minTime.setTime(finalDate.getTime() + 30 * minute);
                formik.setFieldValue('eventEnd', minTime);
            }
        }
    };

    const onLocationChange = (result: any) => {
        geocodeByAddress(result.description)
            .then((gecodeResult) => {
                getLatLng(gecodeResult[0])
                    .then(({ lat, lng }) => {
                        formik.setFieldValue('location', {
                            label: gecodeResult[0].formatted_address,
                            lon: lng,
                            lat,
                        })
                    }).catch((e) => {
                        dispatch(PushNotification(t('google_api_error'), 'error'));
                        formik.setFieldValue('location', {
                            label: '',
                            lon: null,
                            lat: null,
                        });
                })
                }
            ).catch((e) => {
                dispatch(PushNotification(t('google_api_error'), 'error'));
                formik.setFieldValue('location', {
                    label: '',
                    lon: null,
                    lat: null,
                });
        });
    };

    const computeError = (field: string): string => {
        return formik.touched[field] && formik.errors[field] ?
            'validation:' + formik.errors[field] :
            undefined;
    };

    return (
        <Form onSubmit={formik.handleSubmit}>
            <TextInput
            className={'date-line-field'}
            label={t('date_name_label')}
            placeholder={t('date_name_label')}
            {...formik.getFieldProps('name')}
            error={
                computeError('name') &&
                t(computeError('name'))
            } />
            <div className={'date-line-field date-container'}>
                <CustomDatePicker
                label={t('start_date_label')}
                name={'startDate'}
                dateFormat={'iii, MMM do, yyyy'}
                minDate={new Date()}
                selected={formik.values.eventBegin}
                locale={i18n.language}
                onChange={(date: Date) => onDateChange('eventBegin', date)}
                error={
                    computeError('eventBegin') &&
                    t(computeError('eventBegin'))
                }/>
                <CustomTimePicker
                label={t('start_time_label')}
                name={'startTime'}
                selected={formik.values.eventBegin}
                onChange={(date: Date) => onTimeChange('eventBegin', date)}
                error={
                    computeError('eventBegin') &&
                    t(computeError('eventBegin'))
                }/>
            </div>
            <DateEndContainer
            className={'date-line-field date-container'}
            disabled={!formik.values.eventBegin}>
                <CustomDatePicker
                disabled={!formik.values.eventBegin}
                label={t('end_date_label')}
                name={'endDate'}
                dateFormat={'iii, MMM do, yyyy'}
                minDate={formik.values.eventBegin}
                selected={formik.values.eventEnd}
                locale={i18n.language}
                onChange={(date: Date) => onDateChange('eventEnd', date)}
                error={
                    computeError('eventEnd') &&
                    t(computeError('eventEnd'))
                }/>
                <CustomTimePicker
                disabled={!formik.values.eventBegin}
                label={t('end_time_label')}
                name={'endTime'}
                minTime={compareDates(
                  formik.values.eventBegin,
                  formik.values.eventEnd,
                  TimeScale.day
                ) ? new Date(formik.values.eventBegin.getTime() + 30 * minute) : undefined}
                selected={formik.values.eventEnd}
                onChange={(date: Date) => onTimeChange('eventEnd', date)}
                error={
                    computeError('eventEnd') &&
                    t(computeError('eventEnd'))
                }/>
            </DateEndContainer>
            <LocationInput
            name={'location'}
            className={'date-line-field'}
            initialValue={formik.values.location.label}
            label={t('location_label')}
            placeholder={t('location_placeholder')}
            onSelect={onLocationChange}
            error={
                computeError('location') &&
                t(computeError('location'))
            }/>
            <FormActions
            delete={props.delete}
            cancel={props.cancel}
            newItem={props.newItem}
            disabled={
                !formik.isValid ||
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
