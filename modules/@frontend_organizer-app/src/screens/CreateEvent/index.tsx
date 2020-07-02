import React, { useEffect, useRef, useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import '@frontend/core/lib/utils/window';
import { MergedAppState }           from '../../index';
import { InitEventAcset }           from '../../redux/ducks/event_creation';
import { OrganizerState }           from '../../redux/ducks';

import { Button } from '@frontend/flib-react/lib/components';

import GeneralInfoForm     from './Forms/GeneralInfoForm';
import StylesForm          from './Forms/StylesForm';
import DatesForm           from './Forms/DatesForm';
import CategoriesForm      from './Forms/CategoriesForm';

import { useTranslation }                from 'react-i18next';
import './locales';
import { ResetEventCreateForm }          from './ResetEventCreateForm';
import { ActionSetStatus, ActionStatus } from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { PushNotification }              from '@frontend/core/lib/redux/ducks/notifications';
import { useHistory }                    from 'react-router';

export interface FormProps {
    onComplete: (valid: boolean) => void;
}
const CreateEvent: React.FC = () => {
    const [ t ] = useTranslation('create_event');
    const FormRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    const [ stepIdx, setStepIdx ] = useState<number>(null);
    const [ loadingForms, setLoadingForms ] = useState<boolean[]>([false, false, false, false]);

    const dispatch = useDispatch();
    const history = useHistory();
    const [ token, eventAcsetId, actionsStatuses, currentActionIdx, acsetStatus ]:
        [ string, string, Array<ActionStatus>, number, ActionSetStatus ] =
        useSelector((state: MergedAppState) => [
            state.auth.token.value,
            state.eventCreation.acsetId,
            state.eventCreation.actionsStatuses,
            state.eventCreation.currentActionIdx,
            state.eventCreation.acsetStatus,
        ]);

    const datesLength = useSelector((state: OrganizerState) => state.eventCreation.datesConfiguration.dates.length);

    const handleLoadingState = (updateIdx: number, updateLoadingState: boolean) =>
        setLoadingForms(loadingForms.map(
            (loadingState, idx) => idx === updateIdx ?
                updateLoadingState :
                loadingState
        ));

    useEffect(() => {
        if (!eventAcsetId) {
            dispatch(InitEventAcset());
        }

        if (eventAcsetId && stepIdx === null && actionsStatuses.length > 0) {
            setStepIdx(actionsStatuses.lastIndexOf('complete') + 1);
        }
    }, [
        eventAcsetId,
        stepIdx,
        actionsStatuses,
        dispatch
    ]);

    useEffect(() => {
        if (actionsStatuses.lastIndexOf('complete') === 1) {
            global.window.t721Sdk.actions.update(token, eventAcsetId, {
                data: {},
            }).then(() => {
                console.log('complete module');
            });
        }

        if (actionsStatuses.lastIndexOf('complete') === 4) {
            global.window.t721Sdk.actions.update(token, eventAcsetId, {
                data: {
                    admins: [],
                },
            }).then(() => {
                console.log('complete admins');
            });
        }
    }, [
        actionsStatuses,
        eventAcsetId,
        token,
    ]);

    return (
        <Container>
        {
            eventAcsetId &&
            <Forms>
                <FormWrapper>
                    <Title>{t('general_infos_title')}</Title>
                    <Description>{t('general_infos_description')}<br/>{t('general_infos__tags_description')}</Description>
                    <GeneralInfoForm onComplete={(valid) => handleLoadingState(0, valid)}/>
                    {
                        stepIdx === 0 ?
                            <Button
                            variant={actionsStatuses[0] === 'complete' ? 'primary' : 'disabled'}
                            loadingState={loadingForms[0] && actionsStatuses[0] !== 'complete'}
                            title={loadingForms[0] && actionsStatuses[0] !== 'complete' ? t('loading_btn') : t('next_step_btn')}
                            onClick={() => setStepIdx(1)}/> :
                            null
                    }
                </FormWrapper>
                { stepIdx >= 1 && (
                    <FormWrapper ref={FormRefs[0]} disabled={currentActionIdx < 1}>
                        <Title>{t('styles_title')}</Title>
                        <Description>{t('styles_description')}</Description>
                        <StylesForm onComplete={(valid) => handleLoadingState(1, valid)}/>
                        {
                            stepIdx === 1 ?
                                <Button
                                variant={actionsStatuses[2] === 'complete' ? 'primary' : 'disabled'}
                                loadingState={loadingForms[1] && actionsStatuses[2] !== 'complete'}
                                title={loadingForms[1] && actionsStatuses[2] !== 'complete' ? t('loading_btn') : t('next_step_btn')}
                                onClick={() => setStepIdx(3)}/> :
                                null
                        }
                    </FormWrapper>
                )}
                { stepIdx >= 3 && (
                    <FormWrapper ref={FormRefs[1]} disabled={currentActionIdx < 3}>
                        <Title>{t('dates_title')} {
                            datesLength > 0 ?
                            <span className={'date-quantity'}>
                                - {datesLength} date{datesLength > 1 ? 's' : null}
                            </span> :
                                null
                        }</Title>
                        <Description>{t('dates_description')}</Description>
                        <DatesForm onComplete={(valid) => handleLoadingState(2, valid)}/>
                        {
                            stepIdx === 3 ?
                                <Button
                                variant={actionsStatuses[3] === 'complete' ? 'primary' : 'disabled'}
                                loadingState={loadingForms[2] && actionsStatuses[3] !== 'complete'}
                                title={loadingForms[2] && actionsStatuses[3] !== 'complete' ? t('loading_btn') : t('next_step_btn')}
                                onClick={() => setStepIdx(4)}/> :
                                null
                        }
                    </FormWrapper>
                )}
                {stepIdx >= 4 && (
                    <FormWrapper ref={FormRefs[2]} disabled={currentActionIdx < 4}>
                        <Title>{t('categories_title')}</Title>
                        <CategoriesForm onComplete={(valid) => handleLoadingState(3, valid)}/>
                        <SubmitButton
                            variant={acsetStatus === 'complete' ? 'primary' : 'disabled'}
                            loadingState={loadingForms[3] && actionsStatuses[5] !== 'complete'}
                            title={loadingForms[3] && actionsStatuses[5] !== 'complete' ? t('loading_btn') : t('create_event_btn')}
                            onClick={() => global.window.t721Sdk.events.create.create(
                                token,
                                {completedActionSet: eventAcsetId}
                            ).then(() => history.push('/'))
                                .catch((e) => dispatch(PushNotification(e.message, 'error')))
                            }
                        />
                    </FormWrapper>
                )}
                <ResetEventCreateForm
                token={token}
                eventAcsetId={eventAcsetId}
                onReset={() => setStepIdx(0)}/>
            </Forms>
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

const Forms = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;
`;

const FormWrapper = styled.div<{ disabled?: boolean }>`
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
