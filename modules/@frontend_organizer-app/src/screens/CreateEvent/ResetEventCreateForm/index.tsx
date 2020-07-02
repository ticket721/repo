import React, { useState } from 'react';
import styled                                           from 'styled-components';
import { useDispatch } from 'react-redux';

import '@frontend/core/lib/utils/window';

import { Button, Popup } from '@frontend/flib-react/lib/components';

import { useTranslation }   from 'react-i18next';
import './locales';
import { InitEventAcset }   from '../../../redux/ducks/event_creation';

export interface ResetEventCreateFormProps {
    token: string;
    eventAcsetId: string;
    onReset: () => void;
}

export const ResetEventCreateForm: React.FC<ResetEventCreateFormProps> = ({ token, eventAcsetId, onReset }) => {
    const [ t ] = useTranslation('reset_event_create_form');

    const dispatch = useDispatch();
    const [ showResetPopup, setShowResetPopup ] = useState<boolean>(false);

    return (
        <>
            <ResetLink onClick={() => setShowResetPopup(true)}>{t('reset_link')}</ResetLink>
            {
                showResetPopup &&
                <Popup>
                    <span>{t('confirm_message')}</span>
                    <BtnContainer>
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
                                    onReset();
                                })
                            }
                            }/>
                    </BtnContainer>
                </Popup>
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

const BtnContainer = styled.div`
    width: 100%;
    margin-top: ${props => props.theme.biggerSpacing};
    display: flex;
    justify-content: flex-end;

    & > button {
        width: 40%;
        margin-left: ${props => props.theme.regularSpacing};
    }
`;
