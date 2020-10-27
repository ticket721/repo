import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Formik, FormikHelpers } from 'formik';

import { checkDate, DateCreationPayload } from '@common/global';

import { AppState } from '@frontend/core/lib/redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';

import { Button } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm } from '../../components/GeneralInfoForm';
import { StylesForm } from '../../components/StylesForm';
import { eventParam } from '../types';
import './locales';
import { DatesAndTypologyForm } from '../../components/DatesAndTypologyForm';
import { Stepper, StepStatus } from '../../components/Stepper';

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
        step: 'info',
        title: 'dates_title',
        description: 'dates_description',
    },
];

const initialValues: DateCreationPayload = {
    info: {
        online: false,
        name: '',
        eventBegin: null,
        eventEnd: null,
        location: {
            label: '',
            lon: null,
            lat: null,
        },
    },
    textMetadata: {
        name: '',
        description: '',
    },
    imagesMetadata: {
        avatar: '',
        signatureColors: ['', ''],
    },
};

export const NewDate: React.FC = () => {
    const { t } = useTranslation('create_date');

    const [ currentStep, setCurrentStep ] = useState<number>(0);

    const [ stepStatuses, setStepStatuses ] = useState<StepStatus[]>([]);

    const dispatch = useDispatch();

    const { eventId } = useParams<eventParam>();

    const token = useSelector((state: AppState): string => state.auth.token.value);

    const validate = (datePayload: DateCreationPayload) => {
        const errors = checkDate(datePayload);
        const errorKeys = errors ? Object.keys(errors) : [];
        const eventCreationKeys = stepsInfos.map(stepInfos => stepInfos.step);

        setStepStatuses(
            eventCreationKeys.map(
                (step: string, idx: number) => {
                    if (idx === currentStep) {
                        return 'edit';
                    }

                    if (errorKeys.includes(step)) {
                        return 'invalid';
                    }

                    return 'complete';
                }
            )
        );
        return errors;
    };

    const buildForm = (setFieldValue: any) => {
        switch (currentStep) {
            case 0: return <GeneralInfoForm nameUpdate={(name) => setFieldValue('info.name', name)}/>;
            case 1: return <StylesForm/>;
            case 2: return <DatesAndTypologyForm parentField={'info'}/>;
            default: return <></>;
        }
    };

    const submit = (date: DateCreationPayload, { resetForm }: FormikHelpers<DateCreationPayload>) => {
        global.window.t721Sdk.events.addDate(
            token,
            eventId,
            {date}
        ).then(() => {
            dispatch(PushNotification(t('date_create_success', { entity: 'date' }), 'success'));
            resetForm();
            setCurrentStep(0);
        }).catch((e) => dispatch(PushNotification(e.message, 'error')));
    };

    return (
        <Container>
        {
            <Formik
            initialValues={initialValues}
            onSubmit={submit}
            validate={validate}
            validateOnMount={true}>
                { formikProps =>
                    <>
                        <PositionedStepper>
                            <Stepper
                            steps={stepsInfos.map((infos, idx) => ({
                                label: t(infos.title),
                                status: stepStatuses[idx],
                            }))}
                            editStep={currentStep}
                            onStepClick={(idx) => {
                                setCurrentStep(idx);
                                setTimeout(() => formikProps.validateForm(), 200);
                            }}/>
                        </PositionedStepper>
                        <Form onSubmit={formikProps.handleSubmit}>
                            <StepWrapper>
                                <Title>{t(stepsInfos[currentStep].title)}</Title>
                                <Description>{t(stepsInfos[currentStep].description)}</Description>
                                {
                                    buildForm(formikProps.setFieldValue)
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
                                    title={t('create_date_and_add_categories')}
                                /> :
                                null
                            }
                        </Form>
                    </>
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
