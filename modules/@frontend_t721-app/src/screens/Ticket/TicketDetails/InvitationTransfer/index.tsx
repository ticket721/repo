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

const InvitationTransferContainer = styled.div`
    display: flex;
    align-items: center;
    padding: ${props => props.theme.regularSpacing};
    background-color: ${props => props.theme.darkerBg};

    button {
        margin: 0 0 0 16px;
        width: 140px;
        height: 87px;
    }

    @media screen and (max-width: 500px) {
        flex-direction: column;

        button {
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

const ConfirmModal = styled(motion.div)`
    position: fixed;
    width: 900px;
`;

// eslint-disable-next-line
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
    const isSmallScreen = useMediaQuery({ maxWidth: 900 });

    const history = useHistory();
    const dispatch = useDispatch();

    const [ newOwner, setNewOwner ] = useState<string>('');
    const [ isOwnerValid, setIsOwnerValid ] = useState<boolean>(false);

    const { response, lazyRequest: transfer } = useLazyRequest<InvitationsTransferResponseDto>('invitations.transfer', uuid);

    const { invitations: invitationsResp } = useContext(TicketsContext);

    const transferInvitation = () => {
        setConfirmMsgVisibility(true);
        // transfer([
        //     invitationId,
        //     token,
        //     {
        //         newOwner,
        //     }
        // ], { force: true });
    }

    useEffect(() => {
        if (response.data) {
            console.log(response.data);
            invitationsResp.force();
            dispatch(PushNotification(t('success_transfer', {newOwner}), 'success'));
            history.push('/wallet');
        }
    }, [response.data]);

    useEffect(() => {
        if (response.error) {
            console.log(response.error);
            dispatch(PushNotification(t('failed_transfer'), 'error'));
        }
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
        <ConfirmModal>

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
        onClick={transferInvitation}
        />
    </InvitationTransferContainer>;
}