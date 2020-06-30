import { useFormik }                       from 'formik';
import { useDispatch, useSelector }                               from 'react-redux';
import { SetActionData, SetCurrentAction, SetSync, UpdateAction } from '../../redux/ducks/event_creation';
import { EventCreationActions, EventCreationSteps }               from '../../core/event_creation/EventCreationCore';
import { useEffect }                      from 'react';
import { OrganizerState }                           from '../../redux/ducks';
import { ObjectSchema }                                  from 'yup';

export const useEventCreation = <ActionInputType extends {[key: string]: any}>(
    actIdx: EventCreationSteps,
    eventCreationAction: EventCreationActions,
    validationSchema: ObjectSchema,
    initialValues: ActionInputType,
) => {
    const dispatch = useDispatch();

    const [ eventActionState, currentAction ]:
        [ ActionInputType, EventCreationActions ] =
        useSelector((state: OrganizerState) => [
            state.eventCreation[eventCreationAction] as ActionInputType,
            state.eventCreation.currentAction,
        ]);

    const stringifiedEventActionState = JSON.stringify(eventActionState);

    const formik = useFormik<ActionInputType>({
        initialValues,
        validationSchema,
        onSubmit: () => void dispatch(UpdateAction()),
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
        dispatch(SetSync(false));
        dispatch(SetActionData(eventCreationAction, data));
        dispatch(UpdateAction());
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

    return {
        ...formik,
        handleFocus,
        handleBlur,
        getFieldProps,
        computeError,
        update,
    };
};
