import React                             from 'react';
import { v4 as uuid }                    from 'uuid';
import { useFormik }                     from 'formik';
import { ObjectSchema }                  from 'yup';
import { Dispatch, useEffect, useState } from 'react';
import { useRequest }                    from '../useRequest';
import { ActionsSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { useSelector }                   from 'react-redux';
import { AppState }                      from '../../redux/ducks';

export type ActionBag<ActionInputType> = {
    formik: any;
    data: ActionInputType;
    error: any;
    loading: boolean;
    status: string;
    private: boolean;
    handleChange: (value: string | React.ChangeEvent) => void;
    handleFocus: (value: string | React.ChangeEvent) => void;
    handleBlur: (value: string | React.ChangeEvent) => void;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
    setSelected: (value: string) => void;
    computeError: (field: string) => string | undefined;
}

export interface FormikConfig<ActionInputType> {
    initialValues: ActionInputType,
    validationSchema: ObjectSchema,
}

export const useAction = <ActionInputType>(
    acsetId: string,
    acsetType: string,
    actionIdx: number,
    formikConfig: FormikConfig<ActionInputType>,
    refreshRate?: number
): ActionBag<ActionInputType> => {
    const [ action, setAction ]: [ActionEntity, Dispatch<ActionEntity>] = useState(null);
    const [ selected, setSelected ]: [string, Dispatch<string>] = useState(null);
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const { response } = useRequest<ActionsSearchResponseDto>({
            method: 'actions.search',
            args: [
                token,
                {
                    id: {
                        $eq: acsetId
                    }
                }
            ],
            refreshRate: refreshRate ? refreshRate : 5
    }, `ActionSet(${acsetType})@${uuid()}`);

    const rawResp: string = JSON.stringify(response);

    useEffect(() => {
        setAction(!response.loading ? response.data.actionsets[0].actions[actionIdx] : null);
    }, [ rawResp ]);

    const formik = useFormik({
        initialValues: formikConfig.initialValues,
        validationSchema: formikConfig.validationSchema,
        onSubmit: (values: ActionInputType) => {
            console.log('values', values);
        }
    });

    const computeError = (field: string) => {
        if (!formik.touched[field]) {
            return undefined;
        }

        return formik.errors[field];
    };

    // const handleBlur = (value: string | React.ChangeEvent): void => {
    //     console.log(value);
    // };

    const handleChange = (value: string | React.ChangeEvent): void => {
        console.log(selected);
        formik.handleChange(value);
    };

    const handleFocus = (value: string | React.ChangeEvent): void => {
        if (typeof value === 'string') {
            setSelected(value);
            return;
        }

        setSelected(value.target.id);
    };

    if (!action) {
        return {
            formik,
            data: null,
            error: null,
            loading: response.loading,
            status: null,
            private: null,
            handleChange,
            handleFocus,
            handleBlur: formik.handleBlur,
            handleSubmit: formik.handleSubmit,
            setSelected,
            computeError,
        }
    }

    return {
        formik,
        data: JSON.parse(action.data),
        error: action.error ? JSON.parse(action.error) : null,
        loading: response.loading,
        status: action.status,
        private: action.private,
        handleChange,
        handleFocus,
        handleBlur: formik.handleBlur,
        handleSubmit: formik.handleSubmit,
        setSelected,
        computeError,
    }
};
