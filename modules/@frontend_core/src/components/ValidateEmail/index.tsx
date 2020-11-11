import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, Button } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { useMediaQuery } from 'react-responsive';
import { useLazyRequest } from '../../hooks/useLazyRequest';
import { useToken } from '../../hooks/useToken';
import { v4 } from 'uuid';
import { useDeepEffect } from '../../hooks/useDeepEffect';
import { getEnv } from '../../utils/getEnv';

const isElapsed = (elapsed: number, multiplicator: number): boolean => {
    return elapsed > multiplicator * 10;
};

const remaining = (elapsed: number, multiplicator: number): number => {
    return multiplicator * 10 - elapsed;
};

export const ValidateEmailComponent = () => {
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });
    const { t } = useTranslation('validate_email');
    const [uuid, setUUID] = useState(v4());
    const [multiplicator, setMultiplicator] = useState(1);
    const [lastCalled, setLastCalled] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const token = useToken();

    const lazyResendEmail = useLazyRequest<{}>('resendValidation', uuid);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setElapsed(elapsed + 1);
        }, 1000);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [elapsed]);

    useDeepEffect(() => {
        if (!lazyResendEmail.response.loading && lazyResendEmail.response.called && lastCalled === multiplicator) {
            setUUID(v4());
            setElapsed(0);
            setMultiplicator(multiplicator + 1);
            setLastCalled(multiplicator);
        }
    }, [lazyResendEmail.response.loading, lazyResendEmail.response.called, multiplicator, lastCalled]);

    const resendEmail = () => {
        if (!lazyResendEmail.response.called) {
            lazyResendEmail.lazyRequest([token, `${getEnv().REACT_APP_SELF}/validate-email`, multiplicator], {
                force: true,
            });
            setLastCalled(multiplicator);
        }
    };
    return (
        <ValidateEmailContainer mobile={isTabletOrMobile}>
            <MailIcon icon={'mail'} color={'#fff'} size={'80px'} />
            <MessageFirstLine>{t('message')}</MessageFirstLine>
            <span>{t('check_your_mailbox')}</span>
            <Button
                variant={
                    isElapsed(elapsed, multiplicator) && !lazyResendEmail.response.loading ? 'primary' : 'disabled'
                }
                title={
                    isElapsed(elapsed, multiplicator) ? t('resend_email') : remaining(elapsed, multiplicator).toString()
                }
                loadingState={lazyResendEmail.response.loading}
                onClick={resendEmail}
            />
            {multiplicator > 1 ? <MaybeSpam>{t('maybe_spam')}</MaybeSpam> : null}
        </ValidateEmailContainer>
    );
};

export const ValidateEmail: React.FC = () => {
    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    width: 450,
                    padding: 60,
                }}
            >
                <ValidateEmailComponent />
            </div>
        </div>
    );
};

interface IValidateEmailContainerInputProps {
    mobile: boolean;
}

const ValidateEmailContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 15px;
    max-height: 100vh;
    background: ${(props: IValidateEmailContainerInputProps) =>
        props.mobile ? 'none' : 'linear-gradient(91.44deg, #241f33 0.31%, #1b1726 99.41%)'};
    border-radius: 15px;
    padding: ${(props) => (props.mobile ? 0 : props.theme.regularSpacing)};
`;

const MessageFirstLine = styled.span`
    margin-bottom: 15px;
    text-align: center;
    line-height: 22px;
`;

const MailIcon = styled(Icon)`
    margin-bottom: 40px;
`;

const MaybeSpam = styled.span`
    margin-top: ${(props) => props.theme.regularSpacing};
    font-size: 12px;
    color: ${(props) => props.theme.textColorDark};
    text-align: center;
`;
