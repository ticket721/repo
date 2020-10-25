import { FilesUploaderProps, ColorPickerProps, DropError } from '@frontend/flib-react/lib/components';
import { useField } from 'formik';

import '@frontend/core/lib/components/ToastStacker/locales';
import { useTranslation }              from 'react-i18next';
import './locales';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import Vibrant from 'node-vibrant';
import { ColorResult } from 'react-color';
import { AppState } from '@frontend/core/lib/redux';
import { EventCreationCore } from '../../core/event_creation/EventCreationCore';

export const useStylesCreationFields = (): {
    avatarProps: FilesUploaderProps,
    primaryColorProps: ColorPickerProps,
    secondaryColorProps: ColorPickerProps,
    preview: string,
} => {
    const dispatch = useDispatch();
    const [ t ] = useTranslation(['event_styles', 'react_dropzone_errors', 'error_notifications']);

    const token: string = useSelector((state: AppState) => state.auth.token.value);

    const [ loadingImg, setLoadingImg ] = useState<boolean>(false);
    const [ preview, setPreview ] = useState<string>('');
    const [ presetColors, setPresetColors ] = useState<string[]>([]);

    const [ avatarField, avatarMeta, avatarHelper ] = useField<string>(`imagesMetadata.avatar`);
    const [ primaryColorField,, primaryColorHelper ] = useField<string>(`imagesMetadata.signatureColors[0]`);
    const [ secondaryColorField,, secondaryColorHelper ] = useField<string>(`imagesMetadata.signatureColors[1]`);

    const uploadImages = (files: File[], previews: string[]) => {
        setLoadingImg(true);
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        EventCreationCore.uploadImages(token, formData, {})
            .then((urls: string[]) => {
                avatarHelper.setValue(urls[0]);
                setLoadingImg(false);
            }).catch((error) => {
                dispatch(PushNotification(t('error_notifications:' + error.message), 'error'));
            });
    };

    const removeImage = () => {
        avatarHelper.setTouched(true);
        avatarHelper.setValue('');
        primaryColorHelper.setValue('');
        secondaryColorHelper.setValue('');
        setPresetColors([]);
        setPreview('');
    };

    const handleDropErrors = (errors: DropError[]) => {
        avatarHelper.setError('react_dropzone_errors:' + errors[0].errorCodes[0]);
    };

    const handleCoverError = () => {
        if (typeof avatarMeta.error === 'string' && avatarMeta.error?.startsWith('react_dropzone_errors')) {
            return t(avatarMeta.error);
        }

        if (avatarMeta.touched && avatarMeta.error) {
            return t('cover_required');
        }
    };

    const generatePresetColors = (src: string) =>
        Vibrant
        .from(src)
        .getPalette()
        .then((palette) => {
            if (primaryColorField.value === '' && secondaryColorField.value === '') {
                primaryColorHelper.setValue(palette.Vibrant.getHex());
                secondaryColorHelper.setValue(palette.Muted.getHex());
            }

            setPresetColors([
                palette.LightVibrant.getHex(),
                palette.LightMuted.getHex(),
                palette.Vibrant.getHex(),
                palette.Muted.getHex(),
                palette.DarkVibrant.getHex(),
                palette.DarkMuted.getHex(),
            ]);
        });

    useEffect(() => {
        if (avatarField.value) {
            setPreview(avatarField.value);
            generatePresetColors(avatarField.value);
        }
        // eslint-disable-next-line
    }, [avatarField.value]);

    return {
        avatarProps: {
            name: avatarField.name,
            multiple: false,
            browseLabel: t('browse'),
            dragDropLabel: t('drag_and_drop'),
            uploadRecommendations: t('image_recommendation'),
            onDrop: uploadImages,
            onDropRejected: handleDropErrors,
            onRemove: removeImage,
            width: '600px',
            height: '300px',
            previewPaths: [preview],
            error: handleCoverError(),
            loading: loadingImg,
        },
        primaryColorProps: {
            label: t('primary_color'),
            presetLabel: t('color_suggestions'),
            presetColors,
            color: primaryColorField.value,
            handleChange: (color: ColorResult) => primaryColorHelper.setValue(color.hex),
        },
        secondaryColorProps: {
            label: t('secondary_color'),
            presetLabel: t('color_suggestions'),
            presetColors,
            color: secondaryColorField.value,
            handleChange: (color: ColorResult) => secondaryColorHelper.setValue(color.hex),
        },
        preview,
    }
};
