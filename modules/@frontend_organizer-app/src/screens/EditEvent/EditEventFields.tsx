import React from 'react';
import { Textarea, TextInput }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';
import { useField } from 'formik';
import { evaluateError } from '../../utils/extractError';
import { StylesForm } from '../../components/StylesForm';

export const EditEventFields: React.FC = () => {
    const [ t ] = useTranslation('edit_event_fields');

    const [nameField, nameMeta] = useField<string>('name');
    const [descField, descMeta] = useField<string>('description');

    return (
        <EditEventFieldsContainer>
            <TextInput
            {...nameField}
            label={t('name_label')}
            placeholder={t('name_placeholder')}
            error={evaluateError(nameMeta)}
            />
            <Textarea
            {...descField}
            label={t('description_label')}
            placeholder={t('description_placeholder')}
            maxChar={10000}
            error={evaluateError(descMeta)}
            />
            <StylesForm eventName={nameField.value}/>
        </EditEventFieldsContainer>
    );
};

const EditEventFieldsContainer = styled.div`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;
