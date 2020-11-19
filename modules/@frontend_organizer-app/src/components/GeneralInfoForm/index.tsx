import React from 'react';
import { RichText, TextInput }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';
import { useField } from 'formik';

import { SocialSection } from './Socials';
import { evaluateError } from '../../utils/extractError';

export const GeneralInfoForm: React.FC<{
    primaryColor?: string,
    nameUpdate?: (name: string) => void,
    uploadDescImage?: (file: File) => Promise<string>
}> = ({ primaryColor, nameUpdate, uploadDescImage }) => {
    const [ t, i18n ] = useTranslation('general_infos');

    const [nameField, nameMeta] = useField<string>('textMetadata.name');
    const [descField, descMeta, descHelper] = useField<string>('textMetadata.description');

    return (
        <GeneralInfos>
            <TextInput
            {...nameField}
            onChange={(e) => {
                nameField.onChange(e);
                if (nameUpdate) {
                    nameUpdate(e.target.value);
                }
            }}
            label={t('name_label')}
            placeholder={t('name_placeholder')}
            error={evaluateError(nameMeta)}
            />
            {
                descField.value ?
                    <RichText
                    {...descField}
                    onBlur={() => descHelper.setTouched(true)}
                    lng={i18n.language.substring(0, 2)}
                    onChange={descHelper.setValue}
                    uploadImage={uploadDescImage}
                    label={t('description_label')}
                    placeholder={t('description_placeholder')}
                    color={primaryColor}
                    maxChar={10000}
                    error={evaluateError(descMeta)}/> :
                null
            }
            <SocialSection />
        </GeneralInfos>
    );
};

const GeneralInfos = styled.div`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;
