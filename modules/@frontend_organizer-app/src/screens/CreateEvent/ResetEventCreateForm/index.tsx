import React, { useState } from 'react';
import styled                                           from 'styled-components';

import '@frontend/core/lib/utils/window';

import { Button, Popup } from '@frontend/flib-react/lib/components';

import { useTranslation }   from 'react-i18next';
import './locales';

export interface ResetEventCreateFormProps {
    token: string;
    onReset: () => void;
}

export const ResetEventCreateForm: React.FC<ResetEventCreateFormProps> = ({ token, onReset }) => {
    const [ t ] = useTranslation('reset_event_create_form');
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
                            onClick={() => setShowResetPopup(false)}
                        />
                        <Button
                            title={t('reset_btn')}
                            variant={'danger'}
                            onClick={() => {
                                onReset();
                                setShowResetPopup(false);
                            }}
                        />
                    </BtnContainer>
                </Popup>
            }
        </>
    )
};

const ResetLink = styled.span`
    font-size: 12px;
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
