import React  from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams } from 'react-router';
import { Button }  from '@frontend/flib-react/lib/components';

import { useTranslation }        from 'react-i18next';
import './locales';

export const DateActions: React.FC = () => {
    const [ t ] = useTranslation('date_actions');
    const history = useHistory();
    const { groupId, dateId } = useParams();


    return (
        <Container>
            <Button
                variant={dateId ? 'primary' : 'disabled'}
                title={t('publish_label')}
                onClick={() => console.log('publish')}
            />
            <Button
                variant={dateId ? 'secondary' : 'disabled'}
                title={t('preview_label')}
                onClick={() => history.push(`/${groupId}/date/${dateId}`)}
            />
        </Container>
    )
};

const Container = styled.div`
    margin: 0 ${props => props.theme.biggerSpacing};

    & > button {
        margin: 0 0 ${props => props.theme.smallSpacing};
        width: 100%;
    }
`;
