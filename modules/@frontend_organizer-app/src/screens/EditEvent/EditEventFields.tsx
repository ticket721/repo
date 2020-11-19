import React, { useEffect } from 'react';
import { RichText, TextInput }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';
import { useField } from 'formik';
import { evaluateError } from '../../utils/extractError';
import { StylesForm } from '../../components/StylesForm';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { useUploadImage } from '@frontend/core/lib/hooks/useUploadImage';
import { useDispatch } from 'react-redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { v4 } from 'uuid';
import { uploadImageWithSdk } from '../../utils/uploadImageWithSdk';

export const EditEventFields: React.FC = () => {
    const [ t, i18n ] = useTranslation('edit_event_fields');

    const dispatch = useDispatch();

    const token = useToken();

    const { url: uploadImgUrl, error: uploadImgError, uploadImage } = useUploadImage(token);
    const [nameField, nameMeta] = useField<string>('name');
    const [descField, descMeta, descHelper] = useField<string>('description');
    const [,,avatarHelper] = useField<string>('avatar');
    const [primaryColorField] = useField<string>('signature_colors[0]');

    useEffect(() => {
        if (uploadImgUrl) {
            avatarHelper.setValue(uploadImgUrl);
        }
        // eslint-disable-next-line
    }, [uploadImgUrl]);

    useEffect(() => {
        if (uploadImgError) {
            dispatch(PushNotification(t('upload_error'), 'error'));
        }
        // eslint-disable-next-line
    }, [uploadImgError]);

    return (
        <EditEventFieldsContainer>
            <TextInput
            {...nameField}
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
                    uploadImage={async (file: File) => {
                        const url = await uploadImageWithSdk(token, file);

                        if (!url) {
                            dispatch(PushNotification(t('upload_error'), 'error'));
                            return;
                        }

                        return url;
                    }}
                    label={t('description_label')}
                    placeholder={t('description_placeholder')}
                    color={primaryColorField.value}
                    maxChar={10000}
                    error={evaluateError(descMeta)}/> :
                null
            }
            <StylesForm
            eventName={nameField.value}
            uploadImage={(file) => uploadImage(file, v4())}/>
        </EditEventFieldsContainer>
    );
};

const EditEventFieldsContainer = styled.div`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;
