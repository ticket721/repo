import React, { useEffect, useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch } from 'react-redux';

import '@frontend/core/lib/utils/window';

import { Button } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm }     from '../../components/GeneralInfoForm';
import { StylesForm }          from '../../components/StylesForm';
import { DatesStep }           from './DatesStep';
import { CategoriesStep }      from './CategoriesStep';

import { useTranslation }                from 'react-i18next';
import './locales';
import { ResetEventCreateForm }          from './ResetEventCreateForm';
import { PushNotification }              from '@frontend/core/lib/redux/ducks/notifications';
import { useHistory }                    from 'react-router';
import { FormikProvider, useFormik } from 'formik';
import { Persist } from 'formik-persist';
import { checkEvent, EventCreationPayload } from '@common/global';
import { DelayedOnMountValidation } from './DelayedOnMountValidation';
import { Stepper, StepStatus } from '../../components/Stepper';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { EventsBuildResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsBuildResponse.dto';
import { v4 } from 'uuid';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { b64ImgtoBlob } from '../../utils/b64ImgtoBlob';
import { useUploadImage } from '@frontend/core/lib/hooks/useUploadImage';

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

    const [ finalEventPaylaod, setFinalEventPaylaod ] = useState<EventCreationPayload>();
    const [ stepStatuses, setStepStatuses ] = useState<StepStatus[]>([]);
    const dispatch = useDispatch();
    const history = useHistory();
    const [uuid] = useState<string>(v4() + '@event-create');
    const token = useToken();
    const { response, lazyRequest: createEvent } = useLazyRequest<EventsBuildResponseDto>('events.create.create', uuid);

    const { url: imageUrl, error: imageError, uploadImage } = useUploadImage(token);

    const [ reader ] = useState<FileReader>(new FileReader());

    const validate = (eventPayload: EventCreationPayload) => {
        const errors = checkEvent(eventPayload);
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

    const onSubmit = (eventPayload: EventCreationPayload) => {
        if (!token) {
            dispatch(PushNotification(t('auth_required'), 'info'));
            history.push('/login', { from: '/create-event' });
        }

        uploadImage(b64ImgtoBlob(eventPayload.imagesMetadata.avatar), v4());
        setFinalEventPaylaod({
            ...eventPayload,
            categoriesConfiguration: eventPayload.categoriesConfiguration.map(category => ({
                ...category,
                price: category.price * 100,
            }))
        });
    };

    const formik = useFormik({
        initialValues,
        onSubmit,
        validate,
    });

    const buildForm = () => {
        switch (currentStep) {
            case 0: return <GeneralInfoForm/>;
            case 1: return <StylesForm
            eventName={formik.values.textMetadata.name}
            parentField={'imagesMetadata'}
            uploadImage={(file) => {
                reader.readAsDataURL(file);
            }}/>;
            case 2: return <DatesStep/>;
            case 3: return <CategoriesStep/>;
            default: return <></>;
        }
    };

    useEffect(() => {
        reader.onloadend = () => {
            formik.setFieldValue('imagesMetadata.avatar', (reader.result as string));
        };
    // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (imageError) {
            dispatch(PushNotification(t('upload_error'), 'error'));
        }
        // eslint-disable-next-line
    }, [imageError]);

    useEffect(() => {
        if (imageUrl && finalEventPaylaod) {
            setFinalEventPaylaod(null);
            createEvent([
                token,
                {
                    eventPayload: {
                        ...finalEventPaylaod,
                        imagesMetadata: {
                            ...finalEventPaylaod.imagesMetadata,
                            avatar: imageUrl,
                        },
                    },
                }
            ], { force: true })
        }
        // eslint-disable-next-line
    }, [imageUrl, finalEventPaylaod]);

    useEffect(() => {
        if (response.data?.event) {
            dispatch(PushNotification(t('event_create_success'), 'success'));
            formik.resetForm();
            formik.validateForm();
            // history.push('/');
        }
    // eslint-disable-next-line
    }, [response.data?.event]);

    useEffect(() => {
        if (response.data?.error) {
            dispatch(PushNotification(t('event_creation_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [response.data?.error]);

    return (
        <Container>
            <PositionedStepper>
                <Stepper
                steps={stepsInfos.map((infos, idx) => ({
                    label: t(infos.title),
                    status: stepStatuses[idx],
                }))}
                editStep={currentStep}
                onStepClick={(idx) => {
                    setCurrentStep(idx);
                    setTimeout(() => formik.validateForm(), 200);
                }}/>
            </PositionedStepper>
            <FormikProvider value={formik}>
                <Form onSubmit={formik.handleSubmit}>
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
                                        setTimeout(() => formik.validateForm(), 200);
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
                                        setTimeout(() => formik.validateForm(), 200);
                                    }}
                                /> :
                                null
                            }
                        </StepButtons>
                    </StepWrapper>
                    {
                        stepStatuses.every(status => status === 'complete' || status === 'edit')
                        && formik.isValid ?
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
                        formik.resetForm();
                        formik.validateForm();
                        setCurrentStep(0);
                    }}/>
                    <Persist name={'event-creation'} />
                    <DelayedOnMountValidation/>
                </Form>
            </FormikProvider>
        </Container>
    )
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80px;
    padding: 50px 0;
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
