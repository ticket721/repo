import { FormikConfig, useFormik }                       from 'formik';
import { useDispatch, useSelector }                      from 'react-redux';
import { SetActionData, SetCurrentAction, UpdateAction } from '../../redux/ducks/event_creation';
import { EventCreationActions, EventCreationSteps }      from '../../core/event_creation/EventCreationCore';
import { useEffect, useState }                           from 'react';
import { OrganizerState }                                from '../../redux/ducks';

export const useEventCreation = <ActionInputType extends {[key: string]: any}>(
    actIdx: EventCreationSteps,
    eventCreationAction: EventCreationActions,
    formikConfig: FormikConfig<ActionInputType>
) => {
    const dispatch = useDispatch();

    const [loadingState, setLoadingState ] = useState(false);
    const [ eventActionState, currentAction, lastCompletedStep ]:
        [ ActionInputType, EventCreationActions, EventCreationSteps ] =
        useSelector((state: OrganizerState) => [
            state.eventCreation[eventCreationAction] as ActionInputType,
            state.eventCreation.currentAction,
            state.eventCreation.completedStep,
        ]);

    const stringifiedState = JSON.stringify(eventActionState);
    const formik = useFormik<ActionInputType>({
        initialValues: formikConfig.initialValues,
        validationSchema: formikConfig.validationSchema,
        onSubmit: formikConfig.onSubmit || (() => void dispatch(UpdateAction()))
    });

    useEffect(() => {
        formik.setValues(eventActionState);
    }, [
        currentAction,
        stringifiedState,
        eventCreationAction,
        formik,
    ]);

    useEffect(() => {
        setLoadingState(formik.isValid && lastCompletedStep < actIdx);
    }, [
        lastCompletedStep,
        formik.isValid,
        actIdx
    ]);

    const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

    const submitLoading = () => formik.isValid && lastCompletedStep < actIdx;

    const handleFocus = (value: any): void => {
        if (currentAction !== eventCreationAction) {
            dispatch(SetCurrentAction(eventCreationAction));
        }
    };

    const handleBlur = (event: any, field?: string, value?: any): void => {
        if (field) {
            if (value) {
                dispatch(SetActionData(eventCreationAction, {
                    ...eventActionState,
                    [field]: value
                }));
            } else {
                dispatch(SetActionData(eventCreationAction, {
                    ...eventActionState,
                    [field]: formik.values[field]
                }));
            }
        } else {
            dispatch(SetActionData(eventCreationAction, {
                ...eventActionState,
                [event.target.id]: event.target.value
            }));
        }

        formik.handleBlur(event);
        dispatch(UpdateAction());
    };

    const getFieldProps = (field: string) => {
        return {
            ...formik.getFieldProps(field),
            onFocus: handleFocus,
            onBlur: handleBlur,
        };
    };

    const getSubmitButtonProps = (title: string) => {
        return {
            title,
            type: 'submit',
            variant: formik.isValid ? 'primary' : 'secondary' as 'primary' | 'secondary',
            loadingState,
            disabled: !formik.isValid || loadingState,
            hidden: lastCompletedStep >= actIdx,
        };
    };

    return {
        ...formik,
        handleFocus,
        handleBlur,
        getFieldProps,
        computeError,
        submitLoading,
        getSubmitButtonProps,
    };
};
