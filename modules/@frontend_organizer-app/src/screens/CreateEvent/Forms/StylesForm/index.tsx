import React, { useEffect, useRef, useState } from 'react';
import styled                                           from 'styled-components';

import { EventCreationActions, EventCreationCore, EventCreationSteps } from '../../../../core/event_creation/EventCreationCore';
import { useEventCreation }                                            from '../../../../hooks/useEventCreation';
import { EventsCreateImagesMetadata }                  from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { imagesMetadataValidationSchema }              from './validationSchema';

import {
    FilesUploader,
    DropError,
} from '@frontend/flib-react/lib/components';
import { ComponentsPreview } from './ComponentsPreview';

import { useDispatch, useSelector }                    from 'react-redux';
import { MergedAppState }                              from '../../../../index';
import { PushNotification }                            from '@frontend/core/lib/redux/ducks/notifications';

import { useTranslation } from 'react-i18next';
import '../../../../shared/Translations/StylesForm';
import '@frontend/core/lib/components/ToastStacker/locales';
import { ColorPickers }   from '../../../../components/ColorPickers';
import { useField } from 'formik';
import { evaluateError } from '../../../../utils/extractError';

export const StylesForm: React.FC<{disabled: boolean}> = ({ disabled }) => {
    const dispatch = useDispatch();
    const [ t ] = useTranslation(['event_styles', 'react_dropzone_errors', 'error_notifications', 'validation']);
    const token: string = useSelector((state: MergedAppState) => state.auth.token.value);

    const [ loadingImg, setLoadingImg ] = useState<boolean>(false);

    const [imageField, imageMeta, imageHelper] = useField<string>({ name: 'imagesMetadata.avatar' });
    const [colorsField, , colorsHelper] = useField<[string, string]>({ name: 'imagesMetadata.signatureColors' });

    const [ preview, setPreview ] = useState('');

    const uploadImages = (files: File[], previews: string[]) => {
        setLoadingImg(true);
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        EventCreationCore.uploadImages(token, formData, {})
            .then((urls: string[]) => {
                imageHelper.setValue(urls[0]);
                setLoadingImg(false);
                imageField.onChange('imagesMetadata.avatar');
            }).catch((error) => {
                dispatch(PushNotification(t('error_notifications:' + error.message), 'error'));
            });
    };

    const removeImage = () => {
        imageHelper.setTouched(true);
        imageHelper.setValue('');
        imageField.onChange('imagesMetadata.avatar');
        colorsHelper.setValue(['', '']);
        setPreview('');
    };

    const handleDropErrors = (errors: DropError[]) => {
        imageHelper.setError('react_dropzone_errors:' + errors[0].errorCodes[0]);
    };

    const handleCoverError = () => {
        if (imageMeta.error && typeof imageMeta.error === 'string') {
            if (imageMeta.error.startsWith('react_dropzone_errors')) {
                return t(imageMeta.error);
            }
        }

        return evaluateError(imageMeta);
    };

    useEffect(() => {
        if (imageField.value) {
            setPreview(imageField.value);
        }
    }, [imageField.value]);

    return (
        <StylesContainer>
            <FilesUploader
            name={imageField.name}
            multiple={false}
            browseLabel={t('browse')}
            dragDropLabel={t('drag_and_drop')}
            uploadRecommendations={t('image_recommendation')}
            onDrop={uploadImages}
            onDropRejected={handleDropErrors}
            onRemove={removeImage}
            width={'600px'}
            height={'300px'}
            previewPaths={[preview]}
            error={handleCoverError()}
            loading={loadingImg}
            />
            <ColorPickerContainer disabled={disabled || !imageField.value}>
                <ColorPickers
                {...colorsField}
                onChange={(colors: [string, string]) => colorsHelper.setValue(colors)}
                srcImage={preview}/>
            </ColorPickerContainer>
            {
                preview && colorsField.value[0] !== '' &&
                <ComponentsPreview
                previewSrc={preview}
                colors={colorsField.value}
                />
            }
        </StylesContainer>
    );
};

const StylesContainer = styled.div`
    > div {
        margin-bottom: 35px
    }

    & > button {
        margin: 45px 0;
        outline: none;
    }
`;

const ColorPickerContainer = styled.div<{ disabled: boolean }>`
    opacity: ${props => props.disabled ? 0.3 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;
