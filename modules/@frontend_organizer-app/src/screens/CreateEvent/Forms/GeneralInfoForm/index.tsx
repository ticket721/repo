import React from 'react';
import { RichText, Textarea, TextInput }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';
import { FormProps }      from '../../';
import { useDeepEffect }  from '@frontend/core/lib/hooks/useDeepEffect';
import { useField } from 'formik';

import { SocialSection } from './Socials/SocialSection';
import { evaluateError } from '../../../../utils/extractError';

export const GeneralInfoForm: React.FC = () => {
    const [ t ] = useTranslation('general_infos');

    const [nameField, nameMeta] = useField<string>({ name: 'textMetadata.name' });
    const [descField, descMeta] = useField<string>({ name: 'textMetadata.description' });

    return (
        <GeneralInfos>
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
            <SocialSection/>
        </GeneralInfos>
    );
};

const GeneralInfos = styled.div`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;
