import React from 'react';
import {
    CustomDatePicker,
} from '@frontend/flib-react/lib/components';
import styled                            from 'styled-components';

import { useTranslation }              from 'react-i18next';
import { LocationInput }               from '@frontend/core/lib/components/LocationInput';
import { getLatLng, geocodeByAddress } from 'react-google-places-autocomplete';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                 from 'react-redux';

import './locales';
import { getEnv }                      from '@frontend/core/lib/utils/getEnv';

interface Props {
    formik: any;
    formActions: () => JSX.Element;
    className?: string;
}

const DateForm = ({ formik, formActions, className }: Props) => {
    const dispatch = useDispatch();
    const [ t, i18n ] = useTranslation(['date_form', 'vaildation', 'errors']);

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
                        }).catch(() => {
                        dispatch(PushNotification(t('google_api_error'), 'error'));
                        formik.setFieldValue('location', {
                            label: '',
                            lon: null,
                            lat: null,
                        });
                    })
                }
            ).catch(() => {
            dispatch(PushNotification(t('google_api_error'), 'error'));
            formik.setFieldValue('location', {
                label: '',
                lon: null,
                lat: null,
            });
        });
    };

    const computeError = (field: string): string => {
        if (field === 'location') {
            return formik.touched.location && formik.errors.location?.label ?
                'validation:' + formik.errors.location.label :
                undefined;
        }

        return formik.touched[field] && formik.errors[field] ?
            'validation:' + formik.errors[field] :
            undefined;
    };

    return (
        <Container className={className}>
            <DateRangeInput>
                <CustomDatePicker
                    placeholder={t('select_date')}
                    label={t('start_date_label')}
                    name={'startDate'}
                    dateFormat={'iii, MMM do, yyyy - HH:mm'}
                    minDate={new Date()}
                    selected={formik.values.eventBegin}
                    startDate={formik.values.eventBegin}
                    endDate={formik.values.eventEnd}
                    locale={i18n.language}
                    onChange={(date: Date) => {
                        formik.setFieldTouched('eventBegin');
                        formik.setFieldValue('eventBegin', date)
                    }}
                    selectsStart
                    showTime
                    timeInputLabel={t('start_time_input_label')}
                    error={
                        computeError('eventBegin') &&
                        t(computeError('eventBegin'))
                    }/>
                <CustomDatePicker
                    placeholder={t('select_date')}
                    disabled={!formik.values.eventBegin}
                    label={t('end_date_label')}
                    name={'endDate'}
                    dateFormat={'iii, MMM do, yyyy - HH:mm'}
                    minDate={formik.values.eventBegin}
                    selected={formik.values.eventEnd}
                    startDate={formik.values.eventBegin}
                    endDate={formik.values.eventEnd}
                    locale={i18n.language}
                    onChange={(date: Date) => {
                        formik.setFieldTouched('eventEnd');
                        formik.setFieldValue('eventEnd', date)
                    }}
                    selectsEnd
                    showTime
                    timeInputLabel={t('end_time_input_label')}
                    error={
                        computeError('eventEnd') &&
                        t(computeError('eventEnd'))
                    }/>
            </DateRangeInput>
            <LocationInput
                googleApiKey={getEnv().REACT_APP_GOOGLE_PLACES_API_KEY}
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
            {formActions()}
        </Container>
    );
};

const Container = styled.div`
    & .date-line-field {
        margin-bottom: ${props => props.theme.biggerSpacing};
    }
`;

const DateRangeInput = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: ${props => props.theme.biggerSpacing};

    & > div:first-child {
        margin-bottom: ${props => props.theme.regularSpacing};
    }
`;

export default DateForm;
