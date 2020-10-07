import React, { useEffect, useRef, useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import '@frontend/core/lib/utils/window';
import { MergedAppState }           from '../../index';
import { OrganizerState }           from '../../redux/ducks';

import { Button } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm }     from './Forms/GeneralInfoForm';
import { StylesForm }          from './Forms/StylesForm';
// import DatesForm           from './Forms/DatesForm';
// import CategoriesForm      from './Forms/CategoriesForm';

import { useTranslation }                from 'react-i18next';
import './locales';
import { ResetEventCreateForm }          from './ResetEventCreateForm';
import { PushNotification }              from '@frontend/core/lib/redux/ducks/notifications';
import { useHistory }                    from 'react-router';
import { FullPageLoading }                from '@frontend/flib-react/lib/components';
import { Formik, FormikHelpers, useFormikContext } from 'formik';
import { Persist } from 'formik-persist';
import { checkEvent, EventCreationPayload } from '@common/global';

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

const CreateEvent: React.FC = () => {
    const [ t ] = useTranslation('create_event');

    const themeFormRef = useRef(null);
    const datesFormRef = useRef(null);
    const categoriesFormRef = useRef(null);

    const [ stepIdx, setStepIdx ] = useState<number>(null);
    const [ loadingForms, setLoadingForms ] = useState<boolean[]>([false, false, false, false]);
    const [ validSteps, setValidSteps ] = useState<string[]>([]);
    const dispatch = useDispatch();
    const history = useHistory();
    const token: string = useSelector((state: MergedAppState) => state.auth.token.value);

    const datesLength = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates.length);

    const handleLoadingState = (updateIdx: number, updateLoadingState: boolean) =>
        setLoadingForms(loadingForms.map(
            (loadingState, idx) => idx === updateIdx ?
                updateLoadingState :
                loadingState
        ));

console.log('validSteps:', validSteps);
    return (
        <Container>
        {
            <Formik
            initialValues={initialValues}
            onSubmit={(eventPayload: EventCreationPayload, { resetForm }) => {
                global.window.t721Sdk.events.create.create(
                    token,
                    {
                        eventPayload,
                    }
                ).then((event) => {
                    dispatch(PushNotification(t('event_create_success'), 'success'));
                    history.push('/group/' + event.data.event.group_id);
                })
                    .catch((e) => dispatch(PushNotification(e.message, 'error')))
                resetForm();
            }}
            validateOnMount={true}
            validate={(eventPayload: EventCreationPayload) => {
                const errors = checkEvent(eventPayload);
                const errorKeys = Object.keys(errors);
                const eventCreationKeys = Object.keys(eventPayload);
console.log('payload:', eventPayload);
console.log('errors:', errors);
                setValidSteps(
                    eventCreationKeys.filter(
                        (step: string) => errorKeys.findIndex((key: string) => key === step) === -1
                    )
                );
                return checkEvent(eventPayload);
            }}>
                { props =>
                    <Form>
                        <StepWrapper>
                            <Title>{t('general_infos_title')}</Title>
                            <Description>{t('general_infos_description')}</Description>
                            <GeneralInfoForm/>
                        </StepWrapper>
                        <StepWrapper disabled={validSteps.findIndex((step: string) => step === 'textMetadata') === -1} ref={themeFormRef}>
                            <Title>{t('styles_title')}</Title>
                            <Description>{t('styles_description')}</Description>
                            <StylesForm disabled={validSteps.findIndex((step: string) => step === 'textMetadata') === -1}/>
                        </StepWrapper>
                        {/*
                        <StepWrapper ref={datesFormRef}>
                            <Title>{t('dates_title')} {
                                datesLength > 0 ?
                                <span className={'date-quantity'}>
                                    - {datesLength} date{datesLength > 1 ? 's' : null}
                                </span> :
                                    null
                            }</Title>
                            <Description>{t('dates_description')}</Description>
                            <DatesForm onComplete={(valid) => handleLoadingState(2, valid)}/>
                        </StepWrapper>
                        <StepWrapper ref={categoriesFormRef}>
                            <Title>{t('categories_title')}</Title>
                            <CategoriesForm onComplete={(valid) => handleLoadingState(3, valid)}/>
                        </StepWrapper> */}
                        <SubmitButton
                            variant={'primary'}
                            title={t('create_event_btn')}
                        />
                        <ResetEventCreateForm
                        token={token}
                        onReset={() => props.resetForm()}/>
                        <Persist name={'event-creation'} />
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

const Form = styled.form`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;
`;

const StepWrapper = styled.div<{ disabled?: boolean }>`
    width: 100%;
    margin: 50px 0;
    min-height: 65vh;
    opacity: ${props => props.disabled ? 0.3 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
    filter: ${props => props.disabled ? 'grayscale(0.8)' : 'none'};
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

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
`;

export default CreateEvent;
