import { CustomDatePickerProps, SelectOption, SelectProps, TextInputProps, ToggleProps } from '@frontend/flib-react/lib/components';

import './locales';
import { useTranslation }              from 'react-i18next';

import { useField } from 'formik';
import { checkFormatDate, formatShort } from '@frontend/core/lib/utils/date';
import { useState } from 'react';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { evaluateError } from '../../utils/extractError';

export interface DateRange {
    eventBegin: Date;
    eventEnd: Date;
}

export interface SaleDeltas {
    beginSaleDelta: number;
    endSaleDelta: number;
}

export const useCategoryCreationFields = (dateRanges: DateRange[], parentField?: string): {
    ticketTypeProps: ToggleProps,
    datesProps: SelectProps,
    nameProps: TextInputProps,
    saleBeginProps: CustomDatePickerProps,
    saleEndProps: CustomDatePickerProps,
    seatsProps: TextInputProps,
    priceProps: TextInputProps,
    duplicateOnProps?: SelectProps,
    relativeSaleDeltas?: SaleDeltas,
} => {
    const [ t, i18n ] = useTranslation('category_fields');
    const [ isMultiDates, setIsMultiDates ] = useState<boolean>(false);
    // const [ selectedDates, setSelectedDates ] = useState<SelectOption[]>([]);
    const [ duplicateOnDates, setDuplicateOnDates ] = useState<SelectOption[]>([]);
    const [ maxDate, setMaxDate ] = useState<Date>(null);

    const [ nameField, nameMeta ] = useField<string>(`${parentField ? parentField + '.' : ''}name`);
    const [ saleBeginField, saleBeginMeta, saleBeginHelper ] = useField<Date>(`${parentField ? parentField + '.' : ''}saleBegin`);
    const [ saleEndField, saleEndMeta, saleEndHelper ] = useField<Date>(`${parentField ? parentField + '.' : ''}saleEnd`);
    const [ seatsField, seatsMeta, seatsHelper ] = useField<number>(`${parentField ? parentField + '.' : ''}seats`);
    const [ priceField, priceMeta, priceHelper ] = useField<number>(`${parentField ? parentField + '.' : ''}price`);
    const [ datesField, datesMeta, datesHelper ] = useField<number[]>(`${parentField ? parentField + '.' : ''}dates`);

    const dateOptions = dateRanges.map((date, dateIdx) => ({
        label: `date n•${dateIdx + 1} - ${formatShort(date.eventBegin)} => ${formatShort(date.eventEnd)}`,
        value: dateIdx.toString(),
    }));

    useDeepEffect(() => {
        const computedMaxDate = dateRanges
        .filter((_, dateIdx) => datesField.value.includes(dateIdx))
        .sort((prevDate, date) => checkFormatDate(date.eventEnd).getTime()
            - checkFormatDate(prevDate.eventEnd).getTime())[0]?.eventEnd;

        setMaxDate(checkFormatDate(computedMaxDate));
    }, [dateRanges, datesField.value]);

    useDeepEffect(() => {
        if (datesField.value.length > 1) {
            setIsMultiDates(true);
        }
    }, [datesField.value]);

    return {
        ticketTypeProps: {
            checked: isMultiDates,
            name: 'isMulti',
            onChange: (value) => {
                setIsMultiDates(value);
                if (!value) {
                    datesHelper.setValue([]);
                }
            },
            label: t(isMultiDates ? 'multi_dates_label' : 'single_date_label'),
        },
        datesProps: {
            options: dateOptions,
            allOpt: isMultiDates ? {
                label: t('all_dates_label'),
                value: 'all',
            } : null,
            value: dateOptions.filter(opt =>
                datesField.value.includes(parseInt(opt.value, 10))
            ),
            onChange: (options: SelectOption[]) => {
                datesHelper.setValue(options ? (options as SelectOption[]).map(date => parseInt(date.value, 10)) : []);
                if (!isMultiDates) {
                    setDuplicateOnDates(duplicateOnDates.filter(date => date.value !== options[0].value));
                }
            },
            onBlur: (e) => datesHelper.setTouched(true),
            multiple: isMultiDates,
            label: t('related_dates_label'),
            placeholder: t(isMultiDates ? 'related_dates_placeholder' : 'related_date_placeholder'),
            error: evaluateError(datesMeta, 0),
        },
        nameProps: {
            ...nameField,
            error: evaluateError(nameMeta),
            label: t('name_label'),
            placeholder: t('name_placeholder'),
        },
        saleBeginProps: {
            ...saleBeginField,
            value: checkFormatDate(saleBeginField.value),
            minDate: new Date(),
            maxDate,
            startDate: checkFormatDate(saleBeginField.value),
            endDate: checkFormatDate(saleEndField.value),
            locale: i18n.language.substring(0, 2),
            onChange: (date: Date) => saleBeginHelper.setValue(date),
            onBlur: () => setTimeout(() => saleBeginHelper.setTouched(true), 200),
            selectsStart: true,
            showTime: true,
            error: evaluateError(saleBeginMeta),
            placeholder: t('date_placeholder'),
            label: t('sale_begin_label'),
            timeInputLabel: t('start_time_input_label'),
        },
        saleEndProps: {
            ...saleEndField,
            value: checkFormatDate(saleEndField.value),
            minDate: checkFormatDate(saleBeginField.value),
            maxDate,
            startDate: checkFormatDate(saleBeginField.value),
            endDate: checkFormatDate(saleEndField.value),
            locale: i18n.language.substring(0, 2),
            onChange: (date: Date) => saleEndHelper.setValue(date),
            onBlur: () => setTimeout(() => saleEndHelper.setTouched(true), 200),
            selectsEnd: true,
            showTime: true,
            error: evaluateError(saleEndMeta),
            placeholder: t('date_placeholder'),
            label: t('sale_end_label'),
            timeInputLabel: t('end_time_input_label'),
        },
        seatsProps: {
            ...seatsField,
            value: seatsField.value?.toString(),
            onChange: (e) => seatsHelper.setValue(parseInt((e.target.value as any).replaceAll(' ', ''), 10)),
            error: evaluateError(seatsMeta),
            label: t('seats_label'),
            placeholder: t('seats_placeholder'),
            options: {
                numeral: true,
                numeralPositiveOnly: true,
                delimiter: ' ',
                numeralDecimalScale: 0,
            }
        },
        priceProps: {
            ...priceField,
            value: priceField.value?.toString().replace('.', ','),
            onChange: (e) => priceHelper.setValue(parseFloat((e.target.value as any).replaceAll(' ', '').replace(',', '.'))),
            options: {
                numeral: true,
                numeralPositiveOnly: true,
                delimiter: ' ',
                numeralDecimalScale: 2,
                numeralDecimalMark: ',',
            },
            error: evaluateError(priceMeta),
            label: t('price_label'),
            placeholder: t('price_placeholder'),
        },
        duplicateOnProps: !isMultiDates && datesField.value.length > 0 ? {
            options: dateOptions.filter(date => datesField.value[0].toString() !== date.value),
            allOpt: {
                label: t('all_dates_label'),
                value: 'all',
            },
            value: duplicateOnDates,
            onChange: (options: SelectOption[]) => setDuplicateOnDates(options),
            multiple: true,
            label: t('duplicate_on_label'),
            placeholder: t('duplicate_on_placeholder'),
        } : null,
        relativeSaleDeltas: !isMultiDates
        && datesField.value
        && datesField.value.length > 0
        && saleBeginField.value
        && saleEndField.value ? {
            beginSaleDelta: checkFormatDate(dateRanges[datesField.value[0]].eventEnd).getTime()
                - checkFormatDate(saleBeginField.value).getTime(),
            endSaleDelta: checkFormatDate(dateRanges[datesField.value[0]].eventEnd).getTime()
                - checkFormatDate(saleEndField.value).getTime(),
        } : null,
    }
};
