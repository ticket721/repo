import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './locales';
import { Button, TextInput } from '@frontend/flib-react/lib/components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 } from 'uuid';
import { InvitationsTransferResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/invitations/dto/InvitationsTransferResponse.dto';
import styled from 'styled-components';
import { TicketsContext } from '@frontend/core/lib/contexts/TicketsContext';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer';
import { injectBlur }                                              from '@frontend/flib-react/lib/utils/blur';
import { useWindowDimensions } from '@frontend/core/lib/hooks/useWindowDimensions';
import { useKeyboardState } from '@frontend/core/lib/hooks/useKeyboardState';
import { getEnv } from '@frontend/core/lib/utils/getEnv';

const InvitationTransferContainer = styled.div`
    display: flex;
    align-items: center;
    padding: ${props => props.theme.regularSpacing};
    background-color: ${props => props.theme.darkerBg};

    > button {
        margin: 0 0 0 16px;
        width: 140px;
        height: 87px;
    }

    @media screen and (max-width: 500px) {
        flex-direction: column;

        > button {
            margin: 16px 0 0;
            width: 80%;
            height: 100%;
        }
    }
`;

const Shadow = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background-color: black;
`;

const ConfirmModal = styled(motion.div)<{
    width: number;
    left: number;
}>`
    position: fixed;
    width: ${props => props.width}px;
    padding:
    ${props => props.theme.biggerSpacing}
    ${props => props.theme.biggerSpacing}
    calc(${props => props.theme.biggerSpacing} + env(safe-area-inset-bottom));
    padding:
    ${props => props.theme.biggerSpacing}
    ${props => props.theme.biggerSpacing}
    calc(${props => props.theme.biggerSpacing} + constant(safe-area-inset-bottom));
    z-index: 10000;
    background-color: blue;
    left: ${props => props.left}px;
    bottom: -100vh;
    border-radius: 8px;

    ${injectBlur('#131119bf', '#131119')};

    @media screen and (max-width: 900px) {
        border-radius: 8px 8px 0 0;
    }
`;

const ConfirmationMsg = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 24px;
    text-align: center;
    font-size: 15px;
`;

const ConfirmActions = styled.div`
    display: flex;
    margin: ${props => props.theme.regularSpacing} 0 -${props => props.theme.smallSpacing};

    > button:last-child {
        margin-left: ${props => props.theme.doubleSpacing};
    }
`;

// eslint-disable-next-line
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const getMenuBottom = (visible, isSmallScreen, keyboard): number | string => {
    if (visible) {
        if (isSmallScreen) {
            return 0;
        }

        if (keyboard.isOpen) {
            return 0;
        }

        return '50%';
    }

    return 0;
}

const getTransformY = (visible, isSmallScreen, keyboard): string => {
    if (visible) {
        if (isSmallScreen) {
            return '0%';
        }

        if (keyboard.isOpen) {
            return '0%';
        }

        return '50%';
    }

    return '100%';
}

export interface InvitationTransferProps {
    invitationId: string;
}

export const InvitationTransfer: React.FC<InvitationTransferProps> = ({
    invitationId
}) => {
    const [t] = useTranslation('invitation_transfer');
    const token = useToken();
    const [uuid] = useState(v4());

    const [confirmMsgVisibility, setConfirmMsgVisibility] = useState<boolean>(false);

    const window = useWindowDimensions();
    const isSmallScreen = useMediaQuery({ maxWidth: 900 });
    const keyboard = useKeyboardState();

    const history = useHistory();
    const dispatch = useDispatch();

    const [ newOwner, setNewOwner ] = useState<string>('');
    const [ isOwnerValid, setIsOwnerValid ] = useState<boolean>(false);

    const { response, lazyRequest: transfer } = useLazyRequest<InvitationsTransferResponseDto>('invitations.transfer', uuid);

    const { invitations: invitationsResp } = useContext(TicketsContext);

    useEffect(() => {
        if (response.data) {
            invitationsResp.force();
            dispatch(PushNotification(t('success_transfer', {newOwner}), 'success'));
            history.push('/wallet');
        }
    // eslint-disable-next-line
    }, [response.data]);

    useEffect(() => {
        if (response.error) {
            console.log(response.error);
            dispatch(PushNotification(t('failed_transfer'), 'error'));
        }

    // eslint-disable-next-line
    }, [response.error]);

    return <InvitationTransferContainer>
        <Shadow
        onClick={() => setConfirmMsgVisibility(false)}
        variants={{
            visible: {
                display: 'block',
                opacity: 0.75,
                transition: {
                    duration: 0.3,
                },
            },
            hidden: {
                display: 'none',
                opacity: 0,
                transition: {
                    duration: 0.3,
                    display: {
                        delay: 0.3,
                        duration: 0,
                    },
                },
            },
        }}
        initial={'hidden'}
        animate={confirmMsgVisibility ? 'visible' : 'hidden'}
        />
        <ConfirmModal
        width={isSmallScreen || keyboard.isOpen ? window.width : 700}
        left={isSmallScreen  || keyboard.isOpen ? 0 : (window.width - 700) / 2}
        transition={{
            duration: isSmallScreen ? 0.3 : 0.5,
        }}
        animate={{
            bottom: getMenuBottom(confirmMsgVisibility, isSmallScreen, keyboard),
            transform: `translateY(${getTransformY(confirmMsgVisibility, isSmallScreen, keyboard)})`
        }}>
            <ConfirmationMsg>
                <span>{t('confirm_msg_1')} <strong>{newOwner}</strong></span>
                <span>{t('confirm_msg_2')}</span>
            </ConfirmationMsg>
            <ConfirmActions>
                <Button
                title={t('cancel_btn')}
                variant={'secondary'}
                onClick={() => setConfirmMsgVisibility(false)}/>
                <Button
                title={t('confirm_btn')}
                variant={'primary'}
                onClick={() =>
                    transfer([
                        invitationId,
                        token,
                        {
                            newOwner,
                            appUrl: getEnv().REACT_APP_SELF,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
                    ], { force: true })
                }/>
            </ConfirmActions>
        </ConfirmModal>
        <TextInput
        name={'email'}
        label={t('input_label')}
        placeholder={t('input_placeholder')}
        type={'email'}
        value={newOwner}
        onChange={(e) => {
            setNewOwner(e.target.value);
            setIsOwnerValid(emailRegex.test(e.target.value));
        }}
        />
        <Button
        title={t('transfer_btn')}
        variant={isOwnerValid ? 'primary' : 'disabled'}
        loadingState={response.loading}
        onClick={() => setConfirmMsgVisibility(true)}
        />
    </InvitationTransferContainer>;
}