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
    width: min(80%, 500px);
    margin-top: 20px;
    font-size: 20px;
    font-weight: 300;
`;

const Submitted = styled.span`
    margin-top: 30px;
    font-size: 16px;
    opacity: 1;
    font-weight: 300;
    width: min(80%, 500px);
`;

const ButtonContainer = styled.div`
    margin-top: 30px;
    width: min(60%, 300px);
`;

export const Crash = (): JSX.Element => {
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
                <Button
                    title={t('back_to_app')}
                    variant={'primary'}
                    onClick={() => {
                        window.location.replace('/');
                    }}
                />
            </ButtonContainer>
        </Container>
    );
};
