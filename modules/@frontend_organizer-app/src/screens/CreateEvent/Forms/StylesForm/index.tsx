import React, { Dispatch, useEffect, useState } from 'react';
import styled                                   from 'styled-components';

import { EventCreationActions, EventCreationCore, EventCreationSteps } from '../../../../core/event_creation/EventCreationCore';
import { useEventCreation }                                            from '../../../../hooks/useEventCreation';
import { EventsCreateImagesMetadata }                  from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { imagesMetadataValidationSchema }              from './validationSchema';

import {
    FilesUploader,
    DropError,
    Loader,
} from '@frontend/flib-react/lib/components';
import { ComponentsPreview } from './ComponentsPreview';

import { useDispatch, useSelector }                    from 'react-redux';
import { MergedAppState }                              from '../../../../index';
import { ImageEntity }                                 from '@common/sdk/lib/@backend_nest/libs/common/src/images/entities/Image.entity';
import { PushNotification }                            from '@frontend/core/lib/redux/ducks/notifications';

import { useTranslation } from 'react-i18next';
import './locales';
import '@frontend/core/lib/components/ToastStacker/locales';
import { ColorPickers }   from './ColorPickers';
import { getImgPath }     from '@frontend/core/lib/utils/images';
import { OrganizerState } from '../../../../redux/ducks';

const StylesForm: React.FC = () => {
    const dispacth = useDispatch();
    const [ t ] = useTranslation(['event_creation_styles', 'react_dropzone_errors', 'error_notifications', 'validation']);
    const token: string = useSelector((state: MergedAppState) => state.auth.token.value);
    const cover: string = useSelector((state: OrganizerState) => state.eventCreation.imagesMetadata.avatar);
    const [ uploading, setUploading ]: [ boolean, Dispatch<boolean> ] = useState(null);
    const eventCreationFormik = useEventCreation<EventsCreateImagesMetadata>(
        EventCreationSteps.Styles,
        EventCreationActions.ImagesMetadata,
        imagesMetadataValidationSchema,
    );

    const [ preview, setPreview ] = useState('');

    const uploadImages = (files: File[], previews: string[]) => {
        eventCreationFormik.handleFocus('');
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));

        setUploading(true);
        EventCreationCore.uploadImages(token, formData, {})
            .then((ids: ImageEntity[]) => {
                eventCreationFormik.setFieldTouched('avatar');
                eventCreationFormik.update({
                    ...eventCreationFormik.values,
                    avatar: ids[0].id
                });
            }).catch((error) => {
                dispacth(PushNotification(t('error_notifications:' + error.message), 'error'));
            }).finally(() => setUploading(false));
    };

    const removeImage = () => {
        eventCreationFormik.handleFocus('');
        eventCreationFormik.update({
            avatar: '',
            signatureColors: [],
        });
        setPreview('');
    };

    const handleDropErrors = (errors: DropError[]) => {
        let finalError: string = '';
        for (const err of errors[0].errorCodes) {
            finalError = finalError.concat(' ' + t('react_dropzone_errors:' + err));
        }

        eventCreationFormik.setFieldError('avatar', finalError);
    };

    const updateColor = (signatureColors: string[]) => {
        eventCreationFormik.handleFocus('');
        eventCreationFormik.update({
            ...eventCreationFormik.values,
            signatureColors,
        });
    };

    useEffect(() => {
        if (cover) {
            setPreview(getImgPath(cover));
        }
    }, [cover]);

    return (
        <StyledForm onSubmit={eventCreationFormik.handleSubmit}>
            <FilesUploader
            name={'avatar'}
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
            error={
                eventCreationFormik.computeError('avatar') &&
                t(eventCreationFormik.computeError('avatar'))
            }
            />
            {
                uploading ?
                    <Loader size={'25px'}/> :
                    null
            }

            <ColorPickers
            srcImage={preview}
            colors={eventCreationFormik.values.signatureColors}
            onColorsChange={updateColor}/>
            {
                preview && eventCreationFormik.values.signatureColors.length === 2 &&
                <ComponentsPreview
                previewSrc={preview}
                colors={eventCreationFormik.values.signatureColors}
                />
            }
        </StyledForm>
    );
};

const StyledForm = styled.form`
    > div {
        margin-bottom: 35px
    }

    & > button {
        margin: 45px 0;
        outline: none;
    }
`;

export default StylesForm;
