import { FormikConfig, useFormik }      from 'formik';
import { useDispatch, useSelector }                      from 'react-redux';
import { SetActionData, SetCurrentAction, UpdateAction } from '../../redux/ducks/event_creation';
import { EventCreationActions } from '../../core/event_creation/EventCreationCore';
import { useEffect }  from 'react';
import { OrganizerState }       from '../../redux/ducks';

export const useEventCreation = <ActionInputType extends {[key: string]: any}>(
    eventCreationAction: EventCreationActions,
    formikConfig: FormikConfig<ActionInputType>
) => {
    const dispatch = useDispatch();

    const [ eventActionState, currentAction ]:
        [ ActionInputType, EventCreationActions ] =
        useSelector((state: OrganizerState) => [
            state.eventCreation[eventCreationAction] as ActionInputType,
            state.eventCreation.currentAction,
        ]);

    const formik = useFormik<ActionInputType>({
        initialValues: formikConfig.initialValues,
        validationSchema: formikConfig.validationSchema,
        onSubmit: formikConfig.onSubmit || (() => void dispatch(UpdateAction()))
    });

    useEffect(() => {
        console.log(formik.values);
        formik.setValues(eventActionState);
    }, [
        currentAction,
        JSON.stringify(eventActionState),
        eventCreationAction,
    ]);

    const computeError = (field: string) => formik.touched[field] ? formik.errors[field] : undefined;

    const handleFocus = (value: any): void => {
        if (currentAction !== eventCreationAction) {
            dispatch(SetCurrentAction(eventCreationAction));
        }
    };

    const handleBlur = (event: any, field?: string, value?: any): void => {
        console.log(event);
        if (field) {
            dispatch(SetActionData(eventCreationAction, {
                ...eventActionState,
                [field]: value
            }));
        } else {
            dispatch(SetActionData(eventCreationAction, {
                ...eventActionState,
                [event.target.id]: event.target.value
            }));
        }

        formik.handleBlur(event);
console.log('update HEREHREHREHREHRE');
        dispatch(UpdateAction());
    };

    const getFieldProps = (field: string) => {
        return {
            ...formik.getFieldProps(field),
            onFocus: handleFocus,
            onBlur: handleBlur,
        };
    };

    return {
        ...formik,
        handleFocus,
        handleBlur,
        getFieldProps,
        computeError,
    };
};
