import React              from 'react';
import styled             from 'styled-components';
import { useTranslation } from 'react-i18next';
import './locales';

const Container = styled.div`
  height: 80vh;
`;

const Body = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.div`
    font-weight: bold;
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.fontStack};
    margin-top: ${props => props.theme.regularSpacing};

    h1 {
        margin-bottom: 0;
        text-align: center;
        font-size: 16px;
    }
`;

const EmptyMessage = styled.p`
  font-weight: 400;
`;

const Tags: React.FC = () => {

    const [t] = useTranslation('tags');

    return <Container>
        <Title>
            <h1>
                {t('title')}
            </h1>
        </Title>
        <Body>
            <EmptyMessage>{t('no_tagged_events')}</EmptyMessage>
        </Body>
    </Container>
};

export default Tags;
