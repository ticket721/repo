import { CustomDatePickerProps, PriceInputProps, SelectOption, SelectProps, TextInputProps, ToggleProps } from '@frontend/flib-react/lib/components';

import './locales';
import { useTranslation }              from 'react-i18next';

import { useField } from 'formik';
import { checkFormatDate } from '@frontend/core/lib/utils/date';
import { useState } from 'react';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { evaluateError } from '../../utils/extractError';
import { useParams } from 'react-router';
import { categoryParam } from '../../screens/types';

const STRIPE_EURO_FIX_FEES = 25;
const STRIPE_EURO_VAR_FEES = 0.014;
const STRIPE_NON_EURO_FIX_FEES = 25;
const STRIPE_NON_EURO_VAR_FEES = 0.029;

const TICKET721_FIX_FEES = 100;
const TICKET721_VAR_FEES = 0.01;

export interface DateRange {
    name: string;
    eventBegin: Date;
    eventEnd: Date;
}

export interface SaleDeltas {
    beginSaleDelta: number;
    endSaleDelta: number;
}

interface EstimatedAmounts {
    european: number;
    international: number;
}

const subtractFees = (price: number): EstimatedAmounts => {
    const subEuroStripeFeesPrice = price
        - STRIPE_EURO_FIX_FEES
        - (price * STRIPE_EURO_VAR_FEES);

    const subInternationalStripeFeesPrice = price
        - STRIPE_NON_EURO_FIX_FEES
        - (price * STRIPE_NON_EURO_VAR_FEES);

    return {
        european: Math.round(subEuroStripeFeesPrice
            - TICKET721_FIX_FEES
            - (subEuroStripeFeesPrice * TICKET721_VAR_FEES)),
        international: Math.round(subInternationalStripeFeesPrice
            - TICKET721_FIX_FEES
            - (subInternationalStripeFeesPrice * TICKET721_VAR_FEES)),
    }
};

const addTicket721Fees = (amount: number): number => {
    return amount + TICKET721_FIX_FEES + (amount * TICKET721_VAR_FEES);
}

const addFees = (amount: number, feesType: 'european' | 'international'): number => {
    const addTicket721FeesPrice = addTicket721Fees(amount);

    if (feesType === 'european') {
        return addTicket721FeesPrice + STRIPE_EURO_FIX_FEES + (addTicket721FeesPrice * STRIPE_EURO_VAR_FEES);
    }

    return addTicket721FeesPrice + STRIPE_NON_EURO_FIX_FEES + (addTicket721FeesPrice * STRIPE_NON_EURO_VAR_FEES);
};

export const useCategoryCreationFields = (dateRanges: DateRange[], parentField?: string): {
    ticketTypeProps: ToggleProps,
    datesProps: SelectProps,
    nameProps: TextInputProps,
    saleBeginProps: CustomDatePickerProps,
    saleEndProps: CustomDatePickerProps,
    seatsProps: TextInputProps,
    freeToggleProps: ToggleProps,
    priceProps: PriceInputProps,
    maxEuroAmountProps: PriceInputProps,
    maxInternationalAmountProps: PriceInputProps,
    duplicateOnProps?: SelectProps,
    relativeSaleDeltas?: SaleDeltas,
} => {
    const [ t, i18n ] = useTranslation('category_fields');
    const [ isMultiDates, setIsMultiDates ] = useState<boolean>(false);
    const [ duplicateOnDates, setDuplicateOnDates ] = useState<SelectOption[]>([]);
    const [ maxDate, setMaxDate ] = useState<Date>(null);
    const [ isFree, setIsFree ] = useState<boolean>(false);

    const [ nameField, nameMeta ] = useField<string>(`${parentField ? parentField + '.' : ''}name`);
    const [ saleBeginField, saleBeginMeta, saleBeginHelper ] = useField<Date>(`${parentField ? parentField + '.' : ''}saleBegin`);
    const [ saleEndField, saleEndMeta, saleEndHelper ] = useField<Date>(`${parentField ? parentField + '.' : ''}saleEnd`);
    const [ seatsField, seatsMeta, seatsHelper ] = useField<number>(`${parentField ? parentField + '.' : ''}seats`);
    const [ currencyField,, currencyHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}currency`);

    const [ payedPriceField, payedPriceMeta, payedPriceHelper ] = useField<number>(`${parentField ? parentField + '.' : ''}price`);
    const [ maxReceivedAmount, setMaxReceivedAmount ] = useState<EstimatedAmounts>(subtractFees(payedPriceMeta.value));

    const [ datesField, datesMeta, datesHelper ] = useField<number[]>(`${parentField ? parentField + '.' : ''}dates`);

    const [ lastCurrency, setLastCurrency ] = useState<string>(currencyField.value === 'FREE' ? 'EUR' : currencyField.value);

    const dateOptions = dateRanges.map((date, dateIdx) => ({
        label: date.name,
        value: dateIdx.toString(),
    }));

    const { categoryId } = useParams<categoryParam>();

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
        } else {
            setIsMultiDates(false);
        }
    }, [datesField.value, categoryId]);

    useDeepEffect(() => {
        if (currencyField.value === 'FREE') {
            setIsFree(true);
        }
    }, [currencyField.value]);

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
        freeToggleProps: {
            checked: isFree,
            name: 'isFree',
            onChange: (isCheck) => {
                if (isCheck) {
                    payedPriceHelper.setValue(0);
                    setMaxReceivedAmount({
                        european: 0,
                        international: 0
                    });
                    currencyHelper.setValue('FREE');
                } else {
                    currencyHelper.setValue(lastCurrency);
                }
                setIsFree(isCheck);
                currencyHelper.setTouched(true);
                setTimeout(() => {
                    payedPriceHelper.setTouched(true);
                }, 300);
            },
            label: t('free'),
        },
        priceProps: {
            name: payedPriceField.name,
            currName: currencyField.name,
            value: payedPriceField.value,
            currency: lastCurrency,
            error: evaluateError(payedPriceMeta),
            label: t('price_label'),
            placeholder: t('price_placeholder'),
            disabled: isFree,
            onPriceChange: (newPrice) => {
                payedPriceHelper.setValue(newPrice);
                setMaxReceivedAmount(subtractFees(newPrice));
            },
            onCurrencyChange: (curr) => {
                currencyHelper.setValue(curr);
                setLastCurrency(curr);
            },
            onBlur: payedPriceField.onBlur,
        },
        maxEuroAmountProps: {
            name: 'received_euro_amount',
            value: maxReceivedAmount.european,
            error: evaluateError(payedPriceMeta),
            label: t('euro_received_amount_label'),
            placeholder: t('price_placeholder'),
            disabled: isFree,
            onPriceChange: (newAmount) => {
                const calculatedPrice = addFees(newAmount, 'european');
                setMaxReceivedAmount({
                    ...subtractFees(calculatedPrice),
                    european: newAmount
                });
                payedPriceHelper.setValue(Math.round(calculatedPrice));
            },
            onBlur: payedPriceField.onBlur,
        },
        maxInternationalAmountProps: {
            name: 'received_international_amount',
            value: maxReceivedAmount.international,
            error: evaluateError(payedPriceMeta),
            label: t('non_euro_received_amount_label'),
            placeholder: t('price_placeholder'),
            disabled: isFree,
            onPriceChange: (newAmount) => {
                const calculatedPrice = addFees(newAmount, 'international');
                setMaxReceivedAmount({
                    ...subtractFees(calculatedPrice),
                    international: newAmount
                });
                payedPriceHelper.setValue(Math.round(calculatedPrice));
            },
            onBlur: payedPriceField.onBlur,
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
