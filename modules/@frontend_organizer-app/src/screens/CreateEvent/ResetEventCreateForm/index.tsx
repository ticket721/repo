import React, { useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch } from 'react-redux';

import '@frontend/core/lib/utils/window';

import { Button } from '@frontend/flib-react/lib/components';

import { useTranslation }   from 'react-i18next';
import './locales';
import { InitEventAcset }   from '../../../redux/ducks/event_creation';

export interface ResetEventCreateFormProps {
    token: string;
    eventAcsetId: string;
}

export const ResetEventCreateForm: React.FC<ResetEventCreateFormProps> = ({ token, eventAcsetId }) => {
    const [ t ] = useTranslation('reset_event_create_form');

    const dispatch = useDispatch();
    const [ showResetPopup, setShowResetPopup ] = useState<boolean>(false);

    return (
        <>
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
