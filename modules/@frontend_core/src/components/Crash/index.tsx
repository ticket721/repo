import React from 'react';
import './locales';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button } from '@frontend/flib-react/lib/components';

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const Sorry = styled.span`
    margin-top: 20px;
    font-size: 35px;
    font-weight: 300;
`;

const ErrorOccured = styled.span`
    width: 70%;
    @media screen and (min-width: 900px) {
        width: 500px;
    }
    margin-top: 100px;
    font-size: 16px;
    font-weight: 300;
`;

const Submitted = styled.span`
    margin-top: 15px;
    font-size: 16px;
    opacity: 1;
    font-weight: 300;
    width: 70%;
    @media screen and (min-width: 900px) {
        width: 500px;
    }
`;

const ButtonContainer = styled.div`
    margin-top: 75px;
    width: 70%;
    @media screen and (min-width: 900px) {
        width: 500px;
    }
`;

const SecondaryButton = styled.span`
    margin-top: 10px;
    font-size: 15px;
    font-weight: 400;
    color: ${(props) => props.theme.primaryColor.hex};
    text-decoration: underline;
    cursor: pointer;
`;

interface CrashProps {
    onClick?: () => void;
}

export const Crash: React.FC<CrashProps> = (props: CrashProps): JSX.Element => {
    const [t] = useTranslation('crash');

    return (
        <Container
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flexc',
            }}
        >
            <Sorry>{t('sorry')}</Sorry>
            <ErrorOccured>{t('an_error_occured')}</ErrorOccured>
            <Submitted>{t('submitted')}</Submitted>
            <ButtonContainer>
                {props.onClick ? (
                    <>
                        <Button title={t('sentry_title')} variant={'primary'} onClick={props.onClick} />
                        <SecondaryButton
                            onClick={() => {
                                window.location.replace('/');
                            }}
                        >
                            {t('back_to_app')}
                        </SecondaryButton>
                    </>
                ) : (
                    <Button
                        title={t('back_to_app')}
                        variant={'primary'}
                        onClick={() => {
                            window.location.replace('/');
                        }}
                    />
                )}
            </ButtonContainer>
        </Container>
    );
};
