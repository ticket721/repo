import React                  from 'react';
import {
    CustomDatePicker,
    CustomTimePicker,
    TextInput
}                                   from '@frontend/flib-react/lib/components';
import styled                       from 'styled-components';
import { useFormik }                from 'formik';
import { CategoryItem }       from '../index';
import { categoryValidationSchema } from '../validationSchema';
import { checkFormatDate }               from '@frontend/core/lib/utils/date';
import { FormActions, FormActionsProps } from '../../FormActions';

export interface CategoryFormProps extends FormActionsProps {
    initialValues: CategoryItem;
    confirm: (categoryItem: CategoryItem) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = (props: CategoryFormProps) => {
    const checkedInitialValues: CategoryItem = {
        ...props.initialValues,
        saleBegin: checkFormatDate(props.initialValues.saleBegin),
        saleEnd: checkFormatDate(props.initialValues.saleEnd),
    };

    const formik = useFormik({
        initialValues: checkedInitialValues,
        validationSchema: categoryValidationSchema,
        onSubmit: (categoryItem: CategoryItem) => props.confirm(categoryItem),
    });

    const onSaleDateChange = (dateType: 'saleBegin' | 'saleEnd', date: Date) => {
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

        if (dateType === 'saleBegin') {
            if (date.getTime() > formik.values.saleEnd.getTime()) {
                formik.setFieldValue('saleEnd', new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    ...unchangedTime
                ));
            }
        }
    };

    const onSaleTimeChange = (dateType: 'saleBegin' | 'saleEnd', date: Date) => {
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

    const onPriceChange = (e:  React.ChangeEvent<HTMLInputElement>, price: string) => {
        if (!price.match(/^[1-9]+(.[0-9]?[0-9]?)?$/)) {
            e.preventDefault();
            return;
        }

        formik.setFieldValue('currencies', [{
            currency: 'eur',
            price,
        }]);
    };

    const computeError = (field: string, nestedField?: string): string => {
        if (nestedField) {
            return formik.touched[field] && formik.errors[field][nestedField] ?
                formik.errors[field] :
                undefined
        }

        return formik.touched[field] && formik.errors[field] ?
            formik.errors[field] :
            undefined;
    };

    return (
        <Form onSubmit={formik.handleSubmit}>
            <Title>
                Category informations
            </Title>
            <TextInput
                className={'category-line-field'}
                label='Name'
                placeholder='Provide a name'
                {...formik.getFieldProps('name')}
                error={computeError('name')} />
            <div className={'category-line-field seats-container'}>
                <TextInput
                    name={'price'}
                    label='Price'
                    placeholder='Provide price'
                    value={formik.values.currencies[0].price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPriceChange(e, e.target.value)}
                    error={computeError('price')} />
                <TextInput
                    label='Quantity'
                    placeholder='Provide a quantity'
                    {...formik.getFieldProps('seats')}
                    error={computeError('seats')} />
            </div>
            <Title>
                Sales dates range
            </Title>
            <div className={'category-line-field date-container'}>
                <CustomDatePicker
                    label={'Sale Start Date'}
                    name={'saleDateBegin'}
                    dateFormat={'iii, MMM do, yyyy'}
                    placeholder={'Pick a start date for sales'}
                    minDate={new Date()}
                    selected={formik.values.saleBegin}
                    onChange={(date: Date) => onSaleDateChange('saleBegin', date)}
                    error={computeError('saleBegin')}/>
                <CustomTimePicker
                    label={'Sale Start Time'}
                    name={'saleTimeBegin'}
                    dateFormat={'hh:mm aa'}
                    placeholder={'Pick a start time for sales'}
                    selected={formik.values.saleBegin}
                    onChange={(date: Date) => onSaleTimeChange('saleBegin', date)}
                    error={computeError('saleBegin')}/>
            </div>
            <SaleEndContainer
                className={'category-line-field date-container'}
                disabled={!formik.values.saleBegin}>
                <CustomDatePicker
                    disabled={!formik.values.saleBegin}
                    label={'Sale End Date'}
                    name={'saleEndDate'}
                    dateFormat={'iii, MMM do, yyyy'}
                    placeholder={'Pick an end date for sales'}
                    minDate={formik.values.saleBegin}
                    selected={formik.values.saleEnd}
                    onChange={(date: Date) => onSaleDateChange('saleEnd', date)}
                    error={computeError('saleEnd')}/>
                <CustomTimePicker
                    disabled={!formik.values.saleBegin}
                    label={'Sale End Time'}
                    name={'saleEndTime'}
                    dateFormat={'hh:mm aa'}
                    placeholder={'Pick an end time for sales'}
                    minTime={formik.values.saleBegin}
                    selected={formik.values.saleEnd}
                    onChange={(date: Date) => onSaleTimeChange('saleEnd', date)}
                    error={computeError('saleEnd')}/>
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
