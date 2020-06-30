import React from 'react';
import styled                            from 'styled-components';
import { useFormik }                     from 'formik';
import { DateItem }                      from '../';
import { dateItemValidation }            from '../validationSchema';
import { checkFormatDate }               from '@frontend/core/lib/utils/date';

import { FormActions, FormActionsProps } from '../../../../../components/FormActions';
import GenericDateForm from '../../../../../components/DateForm';

export interface DateFormProps extends FormActionsProps {
    initialValues: DateItem;
    confirm: (date: DateItem) => void;
}

export const UpdateDate: React.FC<DateFormProps> = (props: DateFormProps) => {
    const { initialValues } = props;
    const checkedInitialValues = {
        ...initialValues,
        eventBegin: checkFormatDate(initialValues.eventBegin),
        eventEnd: checkFormatDate(initialValues.eventEnd),
    };

    const formik = useFormik({
        initialValues: checkedInitialValues,
        validationSchema: dateItemValidation,
        onSubmit: (date) => props.confirm(date),
    });

    const renderFormAction = () => (
        <FormActions
            delete={props.delete}
            cancel={props.cancel}
            newItem={props.newItem}
            disabled={
                !formik.isValid ||
                JSON.stringify(formik.values) === JSON.stringify(checkedInitialValues)
            }
        />
    )
    return (
        <Form onSubmit={formik.handleSubmit}>
          <GenericDateForm formik={formik} formActions={renderFormAction} />
        </Form>
    )
};

const Form = styled.form``;
