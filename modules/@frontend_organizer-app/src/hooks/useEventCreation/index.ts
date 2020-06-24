import { useFormik }                       from 'formik';
import { useDispatch, useSelector }                      from 'react-redux';
import { SetActionData, SetCurrentAction, UpdateAction } from '../../redux/ducks/event_creation';
import { EventCreationActions, EventCreationSteps }      from '../../core/event_creation/EventCreationCore';
import { useEffect, useState }                           from 'react';
import { OrganizerState }                                from '../../redux/ducks';
import { ObjectSchema }                                  from 'yup';

export const useEventCreation = <ActionInputType extends {[key: string]: any}>(
    actIdx: EventCreationSteps,
    eventCreationAction: EventCreationActions,
    validationSchema: ObjectSchema,
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

    const stringifiedEventActionState = JSON.stringify(eventActionState);

    const submit = () => {
        dispatch(UpdateAction());
        setLoadingState(formik.isValid);
    };

    const formik = useFormik<ActionInputType>({
        initialValues: eventActionState,
        validationSchema,
        onSubmit: submit,
    });

    useEffect(() => {
        formik.setValues(eventActionState);
    },
        // eslint-disable-next-line
        [
        currentAction,
        stringifiedEventActionState,
        eventCreationAction,
    ]);

    useEffect(() => {
        if (lastCompletedStep < actIdx) {
            setLoadingState(false);
        }
    }, [lastCompletedStep, actIdx]);

    const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

    const handleFocus = (value: any): void => {
        dispatch(SetCurrentAction(eventCreationAction));
    };

    const handleBlur = (event: any, field?: string, value: any = null): void => {
        if (field) {
            if (value !== null) {
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
    };

    const update = (data: any): void => {
        dispatch(SetActionData(eventCreationAction, data));
        submit();
    };

    const getFieldProps = (field: string, updateOnBlur?: boolean) => {
        return {
            ...formik.getFieldProps(field),
            onFocus: handleFocus,
            onBlur: (e: any) => {
                handleBlur(e);
                if (updateOnBlur) {
                    dispatch(UpdateAction());
                }
            },
        };
    };

    const getSubmitButtonProps = (title: string) => ({
        title,
        type: 'submit',
        variant: loadingState ? 'secondary' :
            formik.isValid ? 'primary' : 'disabled' as 'primary' | 'secondary' | 'disabled',
        loadingState,
        hidden: lastCompletedStep >= actIdx,
    });

    return {
        ...formik,
        handleFocus,
        handleBlur,
        getFieldProps,
        computeError,
        submit,
        update,
        getSubmitButtonProps,
    };
};
