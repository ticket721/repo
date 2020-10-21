import { Location } from '@common/global';
import { LocationInputProps } from '@frontend/core/lib/components/LocationInput';
import { CustomDatePickerProps, ToggleProps, TextInputProps } from '@frontend/flib-react/lib/components';
import { useField, useFormikContext } from 'formik';

import './locales';
import { useTranslation }              from 'react-i18next';

import { evaluateError } from '../../../../../../utils/extractError';
import { getEnv } from '@frontend/core/lib/utils/getEnv';
import { useState } from 'react';
import { checkFormatDate } from '@frontend/core/lib/utils/date';

export const useDateCreationFields = (idx: number): {
    eventBeginProps: CustomDatePickerProps,
    eventEndProps: CustomDatePickerProps,
    onlineProps: ToggleProps,
    locationProps?: LocationInputProps,
    onlineLinkProps?: TextInputProps,
} => {
    const [ t, i18n ] = useTranslation('date_fields');

    const [ storedLink, setStoredLink ] = useState<string>();
    const [ storedLocation, setStoredLocation ] = useState<Location>({
        label: '',
        lon: null,
        lat: null,
    });

    const validateForm = useFormikContext().validateForm;

    const [ eventBeginField, eventBeginMeta, eventBeginHelper ] = useField<Date>(`datesConfiguration[${idx}].eventBegin`);
    const [ eventEndField, eventEndMeta, eventEndHelper ] = useField<Date>(`datesConfiguration[${idx}].eventEnd`);
    const [ onlineField,, ] = useField<boolean>(`datesConfiguration[${idx}].online`);
    const [ onlineLinkField, onlineLinkMeta, onlineLinkHelper ] = useField<string>(`datesConfiguration[${idx}].online_link`);
    const [ locationField, locationMeta, locationHelper ] = useField<Location>(`datesConfiguration[${idx}].location`);

    return {
        eventBeginProps: {
            ...eventBeginField,
            value: checkFormatDate(eventBeginField.value),
            minDate: new Date(),
            startDate: checkFormatDate(eventBeginField.value),
            endDate: checkFormatDate(eventEndField.value),
            locale: i18n.language.substring(0, 2),
            onChange: (date: Date) => eventBeginHelper.setValue(date),
            onBlur: () => setTimeout(() => eventBeginHelper.setTouched(true), 200),
            selectsStart: true,
            showTime: true,
            error: evaluateError(eventBeginMeta),
            placeholder: t('date_placeholder'),
            label: t('start_date_label'),
            timeInputLabel: t('start_time_input_label'),
        },
        eventEndProps: {
            ...eventEndField,
            value: checkFormatDate(eventEndField.value),
            minDate: checkFormatDate(eventBeginField.value),
            startDate: checkFormatDate(eventBeginField.value),
            endDate: checkFormatDate(eventEndField.value),
            locale: i18n.language.substring(0, 2),
            onChange: (date: Date) => eventEndHelper.setValue(date),
            onBlur: () => setTimeout(() => eventEndHelper.setTouched(true), 200),
            selectsEnd: true,
            showTime: true,
            error: evaluateError(eventEndMeta),
            placeholder: t('date_placeholder'),
            label: t('end_date_label'),
            timeInputLabel: t('end_time_input_label'),
        },
        onlineProps: {
            name: onlineField.name,
            checked: onlineField.value,
            onChange: (checked, __, e) => {
                onlineField.onChange(e);
                if (checked) {
                    setStoredLocation(locationField.value);
                    locationHelper.setValue(undefined);
                    onlineLinkHelper.setValue(storedLink);
                } else {
                    setStoredLink(onlineLinkField.value ? onlineLinkField.value : undefined);
                    onlineLinkHelper.setValue(undefined);
                    locationHelper.setValue(storedLocation);
                }

                setTimeout(() => {
                    validateForm();
                }, 100);
            },
            label: t(onlineField.value ? 'online_toggle_label' : 'physical_toggle_label'),
        },
        locationProps: !onlineField.value ? {
            ...locationField,
            googleApiKey: getEnv().REACT_APP_GOOGLE_PLACES_API_KEY,
            initialValue: locationField.value?.label,
            onSuccess: (location: Location) => locationHelper.setValue(location),
            onError: () => locationHelper.setValue({label: '', lon: null, lat: null}),
            onFocus: (e) => e.target.select(),
            onBlur: () => locationHelper.setTouched(true),
            error: evaluateError(locationMeta, 'label'),
            label: t('location_label'),
            placeholder: t('location_placeholder'),
        } : null,
        onlineLinkProps: onlineField.value ? {
            ...onlineLinkField,
            value: onlineLinkField.value === undefined ? '' : onlineLinkField.value,
            label: t('live_link_label'),
            placeholder: t('live_link_placeholder'),
            onBlur: (e) => {
                onlineLinkHelper.setTouched(true);
                if (!onlineLinkField.value) {
                    onlineLinkHelper.setValue(undefined);
                }
            },
            error: onlineLinkField.value ? evaluateError(onlineLinkMeta) : null,
        } : null,
    }
};
