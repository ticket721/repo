import React, { useState } from 'react';
import styled                                           from 'styled-components';
import { useHistory }               from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import '@frontend/core/lib/utils/window';

import { Button } from '@frontend/flib-react/lib/components';
import { ActionSetStatus } from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

import { useTranslation }   from 'react-i18next';
import './locales';
import { OrganizerState }   from '../../../redux/ducks';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { InitEventAcset }   from '../../../redux/ducks/event_creation';

export interface EventCreateActionsProps {
    token: string;
    eventAcsetId: string;
}

export const EventCreateActions: React.FC<EventCreateActionsProps> = ({ token, eventAcsetId }) => {
    const [ t ] = useTranslation('create_event_actions');

    const dispatch = useDispatch();
    const history = useHistory();
    const [ showResetPopup, setShowResetPopup ] = useState<boolean>(false);
    const acsetStatus: ActionSetStatus = useSelector((state: OrganizerState) => state.eventCreation.acsetStatus);

    return (
        <>
            {acsetStatus === 'complete' &&
                <SubmitButton
                    variant='primary'
                    title={t('validate_btn')}
                    onClick={() => global.window.t721Sdk.events.create.create(
                        token,
                        {completedActionSet: eventAcsetId}
                        ).then(() => history.push('/'))
                        .catch((e) => dispatch(PushNotification(e.message, 'error')))
                    }
                />
            }
            <ResetLink onClick={() => setShowResetPopup(true)}>{t('reset_link')}</ResetLink>
            {
                showResetPopup &&
                <PopupWrapper>
                    <ResetPopup>
                        <span>{t('confirm_message')}</span>
                        <div>
                            <Button
                                title={t('cancel_btn')}
                                variant={'secondary'}
                                onClick={() => setShowResetPopup(false)}/>
                            <Button
                                title={t('reset_btn')}
                                variant={'danger'}
                                onClick={() => {
                                    global.window.t721Sdk.actions.consumeUpdate(
                                        token,
                                        eventAcsetId,
                                        {
                                            consumed: true
                                        }).then(() => {
                                            setShowResetPopup(false);
                                            dispatch(InitEventAcset());
                                    })
                                }
                                }/>
                        </div>
                    </ResetPopup>
                </PopupWrapper>
            }
        </>
    )
};

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
`;

const ResetLink = styled.span`
    font-size: 12px;
    color: ${(props) => props.theme.primaryColorGradientEnd.hex};
    text-decoration: underline;
    cursor: pointer;
`;

const PopupWrapper = styled.div`
    position: fixed;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    z-index: 3;
    background-color: rgba(0, 0, 0, 0.4);
`;

const ResetPopup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 450px;
    padding: ${props => `${props.theme.doubleSpacing} ${props.theme.biggerSpacing} ${props.theme.smallSpacing}`};
    box-shadow: 0 0 5px #120f1a;
    background-color: #241F33;
    border-radius: ${props => props.theme.defaultRadius};

    & > div {
        width: 100%;
        margin-top: ${props => props.theme.biggerSpacing};
        display: flex;
        justify-content: flex-end;

        & > button {
            width: 40%;
            margin-left: ${props => props.theme.regularSpacing};
        }
    }
`;
