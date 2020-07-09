import React              from 'react';
import {Button}           from '@frontend/flib-react/lib/components';
import styled             from 'styled-components';
import { useHistory }     from 'react-router';
import { useTranslation } from 'react-i18next';

const ButtonWrapper = styled.div`
  width: 200px;
  marginTop: ${props => props.theme.regularSpacing};
`;

const EmptyCart = styled.h3``;

const Container = styled.div`
  height: 80vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;


export const SyncedCartEmpty = () => {

    const history = useHistory();
    const [t] = useTranslation('cart');

    return <Container>
        <EmptyCart>{t('cart_empty_title')}</EmptyCart>
        <ButtonWrapper>
            <Button title={t('cart_empty_button')} variant={'primary'} onClick={history.goBack}/>
        </ButtonWrapper>
    </Container>;
};
