import React, { useEffect } from 'react';
import {
    CustomDatePicker,
    CustomTimePicker,
    TextInput
}                           from '@frontend/flib-react/lib/components';
import styled                       from 'styled-components';
import { useFormik }                from 'formik';
import { categoryValidationSchema }                              from './validationSchema';
import { checkFormatDate, compareDates, day, minute, TimeScale } from '@frontend/core/lib/utils/date';
import { FormActions, FormActionsProps }                         from '../FormActions';

import { useTranslation } from 'react-i18next';
import './locales';

export interface CategoryItem {
    name: string;
    saleBegin: Date;
    saleEnd: Date;
    seats: number;
    currencies: {
        currency: string,
        price: string;
    }[]
}

const defaultInitialValues = {
    name: '',
    saleBegin: new Date(),
    saleEnd: new Date(Date.now() + day),
    seats: 0,
    price: 0,
};

export interface CategoryFormProps extends FormActionsProps {
    initialValues?: CategoryItem;
    maxDate: Date;
    confirm: (categoryItem: CategoryItem) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = (props: CategoryFormProps) => {
    const [ t, i18n ] = useTranslation(['category_form', 'validation']);
    const checkedInitialValues = props.initialValues ? {
        name: props.initialValues.name,
        saleBegin: checkFormatDate(props.initialValues.saleBegin),
        saleEnd: checkFormatDate(props.initialValues.saleEnd),
        seats: props.initialValues.seats,
        price: parseInt(props.initialValues.currencies[0].price, 10) / 100,
    }: defaultInitialValues;

    const formik = useFormik({
        initialValues: checkedInitialValues,
        validationSchema: categoryValidationSchema,
        onSubmit: (categoryItem) => props.confirm({
            name: categoryItem.name,
            saleBegin: categoryItem.saleBegin,
            saleEnd: categoryItem.saleEnd,
            seats: categoryItem.seats,
            currencies: [{
                currency: 'T721Token',
                price: (categoryItem.price * 100).toString(),
            }]
        })
    });

    const onSaleDateChange = (dateType: 'saleBegin' | 'saleEnd', date: Date) => {
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

        if (dateType === 'saleBegin') {
            if (date.getTime() >= formik.values.saleEnd.getTime()) {
                const minTime: Date = new Date();
                minTime.setTime(finalDate.getTime() + 30 * minute);
                formik.setFieldValue('saleEnd', minTime);
            }
        }
    };

    const onSaleTimeChange = (dateType: 'saleBegin' | 'saleEnd', date: Date) => {
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

        if (dateType === 'saleBegin') {
            if (date.getTime() >= formik.values.saleEnd.getTime()) {
                const minTime: Date = new Date();
                minTime.setTime(finalDate.getTime() + 30 * minute);
                formik.setFieldValue('saleEnd', minTime);
            }
        }
    };

    const computeError = (field: string): string => {
        return formik.touched[field] && formik.errors[field] ?
          'validation:' + formik.errors[field] :
          undefined;
    };

    useEffect(() => {
        if (formik.values.saleBegin > props.maxDate) {
            formik.setFieldValue('saleBegin', new Date(props.maxDate.getTime() - 30 * minute));
        }

        if (formik.values.saleEnd > props.maxDate) {
            formik.setFieldValue('saleEnd', props.maxDate);
        }
        // eslint-disable-next-line
    }, [props.maxDate]);

    return (
        <Form onSubmit={formik.handleSubmit}>
            <Title>
                Category informations
            </Title>
            <TextInput
                className={'category-line-field'}
                label={t('category_label')}
                placeholder={t('category_placeholder')}
                {...formik.getFieldProps('name')}
                error={
                    computeError('name') &&
                      t(computeError('name'))
                } />
            <div className={'category-line-field seats-container'}>
                <TextInput
                    type='number'
                    label={t('price_label')}
                    icon={'euro'}
                    placeholder={t('price_placeholder')}
                    {...formik.getFieldProps('price')}
                    error={
                        computeError('price') &&
                        t(computeError('price'))
                    } />
                <TextInput
                    type='number'
                    label={t('quantity_label')}
                    placeholder={t('quantity_placeholder')}
                    {...formik.getFieldProps('seats')}
                    error={
                        computeError('seats') &&
                        t(computeError('seats'))
                    } />
            </div>
            <Title>
                Sales dates range
            </Title>
            <div className={'category-line-field date-container'}>
                <CustomDatePicker
                    label={t('start_sale_date_label')}
                    name={'saleDateBegin'}
                    dateFormat={'iii, MMM do, yyyy'}
                    minDate={new Date()}
                    maxDate={props.maxDate}
                    selected={formik.values.saleBegin}
                    locale={i18n.language}
                    onChange={(date: Date) => onSaleDateChange('saleBegin', date)}
                    error={
                        computeError('saleBegin') &&
                        t(computeError('saleBegin'))
                    }/>
                <CustomTimePicker
                    label={t('start_sale_time_label')}
                    name={'saleTimeBegin'}
                    maxTime={compareDates(
                        formik.values.saleBegin,
                        props.maxDate,
                        TimeScale.day
                    ) ? new Date(props.maxDate.getTime() - 30 * minute) : undefined}
                    selected={formik.values.saleBegin}
                    onChange={(date: Date) => onSaleTimeChange('saleBegin', date)}
                    error={
                        computeError('saleBegin') &&
                        t(computeError('saleBegin'))
                    }/>
            </div>
            <SaleEndContainer
                className={'category-line-field date-container'}
                disabled={!formik.values.saleBegin}>
                <CustomDatePicker
                    disabled={!formik.values.saleBegin}
                    label={t('end_sale_date_label')}
                    name={'saleEndDate'}
                    dateFormat={'iii, MMM do, yyyy'}
                    minDate={formik.values.saleBegin}
                    maxDate={props.maxDate}
                    selected={formik.values.saleEnd}
                    locale={i18n.language}
                    onChange={(date: Date) => onSaleDateChange('saleEnd', date)}
                    error={
                        computeError('saleEnd') &&
                        t(computeError('saleEnd'))
                    }/>
                <CustomTimePicker
                    disabled={!formik.values.saleBegin}
                    label={t('end_sale_time_label')}
                    name={'saleEndTime'}
                    minTime={compareDates(
                        formik.values.saleBegin,
                        formik.values.saleEnd,
                        TimeScale.day
                    ) ? new Date(formik.values.saleBegin.getTime() + 30 * minute) : undefined}
                    maxTime={compareDates(
                        formik.values.saleBegin,
                        props.maxDate,
                        TimeScale.day
                    ) ? props.maxDate : undefined}
                    selected={formik.values.saleEnd}
                    onChange={(date: Date) => onSaleTimeChange('saleEnd', date)}
                    error={
                        computeError('saleEnd') &&
                        t(computeError('saleEnd'))
                    }/>
            </SaleEndContainer>
            <FormActions
                delete={props.delete}
                cancel={props.cancel}
                newItem={props.newItem}
                disabled={
                    !formik.isValid &&
                    JSON.stringify(formik.values) === JSON.stringify(checkedInitialValues)
                }/>
        </Form>
    )
};

const Form = styled.form`
    & > .category-line-field {
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

    .seats-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: ${props => props.theme.doubleSpacing};

        & > div {
            width: calc(50% - 12px);
        }
    }
`;

const Title = styled.span`
    display: block;
    margin-bottom: ${props => props.theme.regularSpacing};
    font-size: 14px;
    font-weight: 500;
`;

const SaleEndContainer = styled.div<{ disabled: boolean }>`
    opacity: ${props => props.disabled ? '0.3' : '1'};
`;
