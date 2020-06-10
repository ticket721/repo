import React from 'react';
import { v4 as uuid } from 'uuid';
import { useFormik } from 'formik';
import { ObjectSchema } from 'yup';
import { Dispatch, useEffect, useState } from 'react';
import { useRequest } from '../useRequest';
import { ActionsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/ducks';

export type ActionBag<ActionInputType extends { [key: string]: any }> = {
    // formik: any;
    values: ActionInputType;
    error: any;
    loading: boolean;
    status: string;
    handleChange: (value: string | React.ChangeEvent) => void;
    // handleFocus: (value: string | React.ChangeEvent) => void;
    setFieldValue: (field: string, value: any) => void;
    setFieldError: (field: string, value: string | undefined) => void;
    handleBlur: (value: string | React.ChangeEvent) => void;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
    computeError: (field: string) => string | undefined;
};

export interface FormikConfig<ActionInputType extends { [key: string]: any }> {
    initialValues: ActionInputType;
    validationSchema: ObjectSchema;
}

// interface EditObject {
//     [key: string]: boolean;
// }

// const useEdit = (initialState: EditObject) => {
//     const [edit, setEditField]: [ EditObject, Dispatch<EditObject> ] = useState(initialState);
//     const setEdit = (field: string, value: boolean) => {
//         setEditField({
//             ...edit,
//             [field]: value
//         });
//     };
//
//     return [ edit, setEdit ];
// };

export const useAction = <ActionInputType>(
    acsetId: string,
    acsetType: string,
    actionIdx: number,
    formikConfig: FormikConfig<ActionInputType>,
    refreshRate?: number,
): ActionBag<ActionInputType> => {
    const [action, setAction]: [ActionEntity, Dispatch<ActionEntity>] = useState(null);
    // const [ selected, setSelected ]: [string, Dispatch<string>] = useState(null);
    const token = useSelector((state: AppState): string => state.auth.token.value);

    // const [ edit, setEdit ] = useEdit(
    //     Object.keys(formikConfig.initialValues)
    //         .reduce((acc, field) => ({
    //             ...acc,
    //             [field]: false
    //         }), {})
    // );

    const { response } = useRequest<ActionsSearchResponseDto>(
        {
            method: 'actions.search',
            args: [
                token,
                {
                    id: {
                        $eq: acsetId,
                    },
                },
            ],
            refreshRate: refreshRate ? refreshRate : 5,
        },
        `ActionSet(${acsetType})@${uuid()}`,
    );

    const rawResp: string = JSON.stringify(response);

    useEffect(() => {
        setAction(!response.loading ? response.data.actionsets[0].actions[actionIdx] : null);
    }, [rawResp]);

    const formik = useFormik({
        initialValues: formikConfig.initialValues,
        validationSchema: formikConfig.validationSchema,
        onSubmit: (values: ActionInputType) => {
            console.log('values', values);
        },
    });

    const computeError = (field: string) => {
        if (!formik.touched[field]) {
            return undefined;
        }

        return formik.errors[field];
    };

    // const handleChange = (value: string | React.ChangeEvent): void => {
    //     console.log(selected);
    //     formik.handleChange(value);
    // };

    // const handleFocus = (value: string | React.ChangeEvent): void => {
    //     if (typeof value === 'string') {
    //         setSelected(value);
    //         return;
    //     }
    //
    //     setSelected(value.target.id);
    // };

    // const getFieldProps = (field: string) => {
    //     return {
    //         ...formik.getFieldProps(field),
    //         onFocus: handleFocus(field)
    //     };
    // };

    if (!action) {
        return {
            // formik,
            values: null,
            error: null,
            loading: response.loading,
            status: null,
            handleChange: formik.handleChange,
            setFieldValue: formik.setFieldValue,
            setFieldError: formik.setFieldError,
            // handleFocus,
            handleBlur: formik.handleBlur,
            handleSubmit: formik.handleSubmit,
            computeError,
        };
    }

    return {
        // formik,
        values: JSON.parse(action.data),
        error: action.error ? JSON.parse(action.error) : null,
        loading: response.loading,
        status: action.status,
        handleChange: formik.handleChange,
        setFieldValue: formik.setFieldValue,
        setFieldError: formik.setFieldError,
        // handleFocus,
        handleBlur: formik.handleBlur,
        handleSubmit: formik.handleSubmit,
        computeError,
    };
};
