import React, { useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import '@frontend/core/lib/utils/window';
import { MergedAppState }           from '../../index';

import { Button } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm }     from './Forms/GeneralInfoForm';
import { StylesForm }          from './Forms/StylesForm';
import { DatesForm }           from './Forms/DatesForm';
import { CategoriesForm }      from './Forms/CategoriesForm';

import { useTranslation }                from 'react-i18next';
import './locales';
import { ResetEventCreateForm }          from './ResetEventCreateForm';
import { PushNotification }              from '@frontend/core/lib/redux/ducks/notifications';
import { useHistory }                    from 'react-router';
import { Formik, FormikHelpers } from 'formik';
import { Persist } from 'formik-persist';
import { checkEvent, EventCreationPayload } from '@common/global';
import { DelayedOnMountValidation } from './DelayedOnMountValidation';
import { Stepper, StepStatus } from './Stepper';

export interface FormProps {
    onComplete: () => void;
}

const initialValues: EventCreationPayload = {
    textMetadata: {
        name: '',
        description: '',
    },
    imagesMetadata: {
        avatar: '',
        signatureColors: ['', ''],
    },
    datesConfiguration: [],
    categoriesConfiguration: [],
};

interface StepInfos {
    step: string;
    title: string;
    description: string;
}

const stepsInfos: StepInfos[] = [
    {
        step: 'textMetadata',
        title: 'general_infos_title',
        description: 'general_infos_description',
    },
    {
        step: 'imagesMetadata',
        title: 'styles_title',
        description: 'styles_description',
    },
    {
        step: 'datesConfiguration',
        title: 'dates_title',
        description: 'dates_description',
    },
    {
        step: 'categoriesConfiguration',
        title: 'categories_title',
        description: 'categories_description',
    },
];

const CreateEvent: React.FC = () => {
    const [ t ] = useTranslation('create_event');

    const [ currentStep, setCurrentStep ] = useState<number>(0);

    const [ stepStatuses, setStepStatuses ] = useState<StepStatus[]>([]);
    const dispatch = useDispatch();
    const history = useHistory();
    const token: string = useSelector((state: MergedAppState) => state.auth.token.value);

    const validate = (eventPayload: EventCreationPayload) => {
        const errors = checkEvent(eventPayload);
        const errorKeys = errors ? Object.keys(errors) : [];
        const eventCreationKeys = Object.keys(eventPayload);

        setStepStatuses(
            eventCreationKeys.map(
                (step: string, idx: number) => {
                    if (idx === currentStep) {
                        return 'edit';
                    }

                    if (idx > currentStep) {
                        return 'disable';
                    }

                    if (errorKeys.includes(step)) {
                        return 'invalid';
                    }

                    return 'complete';
                }
            )
        );
        return checkEvent(eventPayload);
    };

    const buildForm = () => {
        switch (currentStep) {
            case 0: return <GeneralInfoForm/>;
            case 1: return <StylesForm/>;
            case 2: return <DatesForm/>;
            case 3: return <CategoriesForm/>;
            default: return <></>;
        }
    };

    const submit = (eventPayload: EventCreationPayload, { resetForm, validateForm }: FormikHelpers<EventCreationPayload>) => {
        global.window.t721Sdk.events.create.create(
            token,
            {
                eventPayload,
            }
        ).then((event) => {
            dispatch(PushNotification(t('event_create_success'), 'success'));
            resetForm();
            validateForm();
            history.push('/');
        }).catch((e) => dispatch(PushNotification(e.message, 'error')));
    };

    return (
        <Container>
            <PositionedStepper>
                <Stepper
                steps={stepsInfos.map((infos, idx) => ({
                    label: t(infos.title),
                    status: stepStatuses[idx],
                }))}
                editStep={currentStep}/>
            </PositionedStepper>
        {
            <Formik
            initialValues={initialValues}
            onSubmit={submit}
            validate={validate}>
                { formikProps =>
                    <Form onSubmit={formikProps.handleSubmit}>
                        <StepWrapper>
                            <Title>{t(stepsInfos[currentStep].title)}</Title>
                            <Description>{t(stepsInfos[currentStep].description)}</Description>
                            {
                                buildForm()
                            }
                            <StepButtons>
                                {
                                    currentStep > 0 ?
                                    <Button
                                        variant={'secondary'}
                                        title={t('previous_step_btn')}
                                        onClick={() => {
                                            setCurrentStep(currentStep - 1);
                                            setTimeout(() => formikProps.validateForm(), 200);
                                        }}
                                    /> :
                                    <div/>
                                }
                                {
                                    currentStep < (stepsInfos.length - 1) ?
                                    <Button
                                        variant={'primary'}
                                        title={t('next_step_btn')}
                                        onClick={() => {
                                            setCurrentStep(currentStep + 1);
                                            setTimeout(() => formikProps.validateForm(), 200);
                                        }}
                                    /> :
                                    null
                                }
                            </StepButtons>
                        </StepWrapper>
                        {
                            stepStatuses.every(status => status === 'complete' || status === 'edit')
                            && formikProps.isValid ?
                            <SubmitButton
                                type={'submit'}
                                variant={'primary'}
                                title={t('create_event_btn')}
                            /> :
                            null
                        }

                        <ResetEventCreateForm
                        token={token}
                        onReset={() => {
                            formikProps.resetForm();
                            formikProps.validateForm();
                            setCurrentStep(0);
                        }}/>
                        <Persist name={'event-creation'} />
                        <DelayedOnMountValidation/>
                    </Form>
                }
            </Formik>
        }
        </Container>
    )
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

const PositionedStepper = styled.div`
    position: fixed;
    left: ${props => props.theme.doubleSpacing};
    top: calc(50vh - 80px + 4 * 8px);
`;

const Form = styled.form`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;
`;

const StepWrapper = styled.div<{ disabled?: boolean }>`
    width: 100%;
    min-height: 65vh;
    opacity: ${props => props.disabled ? 0.3 : 1};
    filter: ${props => props.disabled ? 'grayscale(0.8)' : 'none'};

    & * {
        pointer-events: ${props => props.disabled ? 'none' : 'auto'};
    }
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.doubleSpacing};
    text-align: left;
    width: 100%;

    .date-quantity {
        font-weight: 400;
        font-size: 15px;
        color: ${props => props.theme.textColorDark};
    }
`;

const Description = styled.h2`
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: ${props => props.theme.textColorDark};
    margin-bottom: ${props => props.theme.biggerSpacing};
    white-space: pre-wrap;
`;

const StepButtons = styled.div`
    display: flex;
    justify-content: space-between;

    button {
        width: fit-content;
        padding: ${props => props.theme.regularSpacing + ' ' + props.theme.biggerSpacing};
    }
`;

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
`;

export default CreateEvent;
