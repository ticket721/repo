import React, { useState } from 'react';
import styled              from 'styled-components';

import { EventCreationActions, EventCreationCore, EventCreationSteps } from '../../core/event_creation/EventCreationCore';
import { useEventCreation }                                            from '../../hooks/useEventCreation';
import { EventsCreateImagesMetadata }                  from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { imagesMetadataValidationSchema }              from './validationSchema';

import {
    FilesUploader,
    DropError,
    ColorPicker,
    Icon,
    Button,
} from '@frontend/flib-react/lib/components';
import { ComponentsPreview } from './ComponentsPreview';

import { useDispatch, useSelector }                    from 'react-redux';
import { MergedAppState }                              from '../../index';
import { ImageEntity }                                 from '@common/sdk/lib/@backend_nest/libs/common/src/images/entities/Image.entity';
import { PushNotification }                            from '@frontend/core/lib/redux/ducks/notifications';

import { ColorResult }                                 from 'react-color';
import Vibrant                                         from 'node-vibrant';

import { useTranslation }                              from 'react-i18next';
import './locales';
import '@frontend/core/lib/components/ToastStacker/locales';

const initialValues: EventsCreateImagesMetadata = {
    avatar: '',
    signatureColors: [],
};

const StylesForm: React.FC = () => {
    const dispacth = useDispatch();
    const [ t ] = useTranslation(['event_creation_styles', 'react_dropzone_errors', 'error_notifications']);
    const token: string = useSelector((state: MergedAppState) => state.auth.token.value);
    const eventCreationFormik = useEventCreation<EventsCreateImagesMetadata>(
        EventCreationSteps.Styles,
        EventCreationActions.ImagesMetadata,
        {
            initialValues,
            validationSchema: imagesMetadataValidationSchema,
            onSubmit: () => console.log('test'),
        }
    );

    const [ preview, setPreview ] = useState('');
    const [ presetColors, setPresetColors ] = useState([]);

    const presetImageAndColors = (src: string) => {
        setPreview(src);
        Vibrant.from(src)
        .getPalette()
        .then((palette) => {
            const paletteColors: string[] = [
                palette.Vibrant.getHex(),
                palette.Muted.getHex(),
            ];

            eventCreationFormik.setFieldValue('signatureColors', paletteColors);
            setPresetColors([
                palette.LightVibrant.getHex(),
                palette.LightMuted.getHex(),
                palette.Vibrant.getHex(),
                palette.Muted.getHex(),
                palette.DarkVibrant.getHex(),
                palette.DarkMuted.getHex(),
            ]);
        });
    };

    const uploadImages = (files: File[], previews: string[]) => {
        eventCreationFormik.handleFocus('');
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));

        EventCreationCore.uploadImages(token, formData, {})
            .then((ids: ImageEntity[]) => {
                eventCreationFormik.setFieldTouched('avatar');
                eventCreationFormik.setFieldValue('avatar', ids[0].id);
                eventCreationFormik.handleBlur('image uploaded', 'avatar', ids[0].id);

                presetImageAndColors(previews[0]);
            }).catch((error) => {
                dispacth(PushNotification(t('error_notifications:' + error.message), 'error'));
            });
    };

    const removeImage = () => {
        eventCreationFormik.setFieldValue('avatar', '');
        eventCreationFormik.setFieldValue('signatureColors', []);
        eventCreationFormik.handleBlur('image uploaded', 'avatar', '');
        setPreview('');
        setPresetColors([]);
    };

    const handleDropErrors = (errors: DropError[]) => {
        let finalError: string = '';
        for (const err of errors[0].errorCodes) {
            finalError = finalError.concat(' ' + t('react_dropzone_errors:' + err));
        }

        eventCreationFormik.setFieldError('avatar', finalError);
    };

    const updateColor = ( idx: number, color: ColorResult) => {
        eventCreationFormik.setFieldValue(
            'signatureColors',
            Object.assign(
                [],
                eventCreationFormik.values.signatureColors,
                {[idx]: color.hex}
            ),
        )
    };

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
            error={eventCreationFormik.computeError('avatar')}
            />
            <Colors>
                <ColorPicker
                label={t('primary_color')}
                presetLabel={t('color_suggestions')}
                presetColors={presetColors}
                color={eventCreationFormik.values.signatureColors[0]}
                handleChange={(color: ColorResult) => updateColor(0, color)}
                onFocus={eventCreationFormik.handleFocus}
                onBlur={() => eventCreationFormik.handleBlur(
                    'color update',
                    'signatureColors',
                    eventCreationFormik.values.signatureColors
                )}
                />
                <div onClick={() => {
                    const [ primary, secondary ] = eventCreationFormik.values.signatureColors;
                    eventCreationFormik.setFieldValue('signatureColors', [secondary, primary]);
                    eventCreationFormik.handleBlur('swap', 'signatureColors', [secondary, primary]);
                }}>
                    <Icon
                    icon={'swap'}
                    size={'22px'}
                    color={'#CCC'}/>
                </div>
                <ColorPicker
                label={t('secondary_color')}
                presetLabel={t('color_suggestions')}
                presetColors={presetColors}
                color={eventCreationFormik.values.signatureColors[1]}
                handleChange={(color: ColorResult) => updateColor(1, color)}
                onFocus={eventCreationFormik.handleFocus}
                onBlur={() => eventCreationFormik.handleBlur(
                    'color update',
                    'signatureColors',
                    eventCreationFormik.values.signatureColors
                )}
                />
            </Colors>
            {
                preview && eventCreationFormik.values.signatureColors.length === 2 &&
                <ComponentsPreview
                    previewSrc={preview}
                    colors={eventCreationFormik.values.signatureColors}
                />
            }
            <Button {...eventCreationFormik.getSubmitButtonProps('Continue')}/>
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

const Colors = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    & > div:first-child,
    & > div:last-child {
        width: calc(50% - 25px);
    }
`;

export default StylesForm;
