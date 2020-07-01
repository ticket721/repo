import React, { useState } from 'react';
import { Button } from '@frontend/flib-react/lib/components';

import { DateItem }     from '../index';
import { day, hour }    from '@frontend/core/lib/utils/date';

import { useTranslation }     from 'react-i18next';
import './locales';
import { FormCard }           from '../../../../../components/FormCard';
import { useFormik }          from 'formik';
import { dateItemValidation } from '../validationSchema';
import { FormActions }        from '../../../../../components/FormActions';
import { isEqual }            from 'lodash';
import GenericDateForm        from '../../../../../components/DateForm';

interface CreateDateProps {
    editable: boolean;
    forcedEdit: boolean;
    onDateCreate: (date: DateItem) => void;
    initialName: string;
    initialLocation?: {
        label: string;
        lon: number;
        lat: number;
    };
}

export const CreateDate: React.FC<CreateDateProps> = (props: CreateDateProps) => {
    const [ t ] = useTranslation('create_date');
    const [ edit, setEdit ] = useState(null);

    const formik = useFormik({
        initialValues: {
            name: props.initialName,
            eventBegin: new Date(Date.now() + hour),
            eventEnd: new Date(Date.now() + day),
            location: props.initialLocation ?
                props.initialLocation :
                {
                    lon: null,
                    lat: null,
                    label: '',
                }
        },
        validationSchema: dateItemValidation,
        onSubmit: (date) => {
            props.onDateCreate(date);
            setEdit(false);
        },
    });

    const renderFormAction = () => (
        <FormActions
            cancel={() => setEdit(false)}
            newItem={true}
            disabled={
                !formik.isValid ||
                isEqual(formik.values, formik.initialValues)
            }
        />
    );

    return (
        <>
            {
                props.forcedEdit || edit ?
                    <FormCard
                    name={''}
                    edit={true}
                    editable={false}
                    setEdit={() => null}>
                        <form onSubmit={formik.handleSubmit}>
                            <GenericDateForm formik={formik} formActions={renderFormAction} />
                        </form>
                    </FormCard> :
                    null
            }
            {
                props.editable && !props.forcedEdit && !edit ?
                    <Button
                    title={t('create_date')}
                    variant={'secondary'}
                    onClick={() => setEdit(true)}/>
                    :
                    null
            }
        </>
    );
};
