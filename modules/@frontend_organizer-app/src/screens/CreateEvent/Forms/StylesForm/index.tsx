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
import { getImgPath }     from '@frontend/core/lib/utils/images';
import { OrganizerState } from '../../../../redux/ducks';
import { FormProps }      from '../../';
import { useDeepEffect }  from '@frontend/core/lib/hooks/useDeepEffect';

const defaultValues: EventsCreateImagesMetadata = {
    avatar: '',
    signatureColors: [],
};

const StylesForm: React.FC<FormProps> = ({ onComplete }) => {
    const reference = useRef(null);
    const dispatch = useDispatch();
    const [ t ] = useTranslation(['event_styles', 'react_dropzone_errors', 'error_notifications', 'validation']);
    const token: string = useSelector((state: MergedAppState) => state.auth.token.value);
    const cover: string = useSelector((state: OrganizerState) => state.eventCreation.imagesMetadata.avatar);
    const [ loadingImg, setLoadingImg ] = useState<boolean>(false);
    const eventCreationFormik = useEventCreation<EventsCreateImagesMetadata>(
        EventCreationSteps.Styles,
        EventCreationActions.ImagesMetadata,
        imagesMetadataValidationSchema,
        defaultValues,
    );

    const [ preview, setPreview ] = useState('');

    const uploadImages = (files: File[], previews: string[]) => {
        setLoadingImg(true);
        eventCreationFormik.handleFocus('');
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        EventCreationCore.uploadImages(token, formData, {})
            .then((urls: string[]) => {
                eventCreationFormik.setFieldTouched('avatar');
                eventCreationFormik.update({
                    ...eventCreationFormik.values,
                    avatar: urls[0]
                });
            }).catch((error) => {
                dispatch(PushNotification(t('error_notifications:' + error.message), 'error'));
            });
    };

    const removeImage = () => {
        eventCreationFormik.setFieldTouched('avatar');
        eventCreationFormik.handleFocus('');
        eventCreationFormik.update({
            avatar: '',
            signatureColors: [],
        });
        setPreview('');
    };

    const handleDropErrors = (errors: DropError[]) => {
        eventCreationFormik.setFieldError('avatar', 'react_dropzone_errors:' + errors[0].errorCodes[0]);
    };

    const handleCoverError = () => {
        if (eventCreationFormik.errors.avatar) {
            if (eventCreationFormik.errors.avatar.startsWith('react_dropzone_errors')) {
                return t(eventCreationFormik.errors.avatar);
            }

            if (eventCreationFormik.touched.avatar) {
                return t('validation:' + eventCreationFormik.errors.avatar);
            }
        }
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
            setLoadingImg(false);
        }
    }, [cover]);

    useDeepEffect(() => {
        if (eventCreationFormik.isValid && eventCreationFormik.values !== eventCreationFormik.initialValues) {
            onComplete(true);
        } else {
            onComplete(false);
        }
    }, [
        eventCreationFormik.isValid,
        eventCreationFormik.initialValues,
        eventCreationFormik.values,
    ]);

    useEffect(() => {
        window.scrollTo({ top: reference.current.offsetTop, left: 0, behavior: 'smooth' });
    }, []);

    return (
        <StyledForm ref={reference} onSubmit={eventCreationFormik.handleSubmit}>
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
            error={handleCoverError()}
            loading={loadingImg}
            />

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
