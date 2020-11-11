import { FilesUploaderProps, ColorPickerProps, DropError } from '@frontend/flib-react/lib/components';
import { useField } from 'formik';

import '@frontend/core/lib/components/ToastStacker/locales';
import { useTranslation }              from 'react-i18next';
import './locales';

import { useEffect, useState } from 'react';
import Vibrant from 'node-vibrant';
import { ColorResult } from 'react-color';

export const useStylesCreationFields = (uploadImage: (files: File) => void, parentField?: string): {
    avatarProps: FilesUploaderProps,
    primaryColorProps: ColorPickerProps,
    secondaryColorProps: ColorPickerProps,
} => {
    const [ t ] = useTranslation(['event_styles', 'react_dropzone_errors']);

    const [ presetColors, setPresetColors ] = useState<string[]>([]);

    const [ avatarField, avatarMeta, avatarHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}avatar`);
    const [ primaryColorField,, primaryColorHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}signatureColors[0]`);
    const [ secondaryColorField,, secondaryColorHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}signatureColors[1]`);

    const removeImage = () => {
        avatarHelper.setTouched(true);
        avatarHelper.setValue('');
        primaryColorHelper.setValue('');
        secondaryColorHelper.setValue('');
        setPresetColors([]);
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
            onDrop: (files: File[]) => uploadImage(files[0]),
            onDropRejected: handleDropErrors,
            onRemove: removeImage,
            width: '600px',
            height: '300px',
            previewPaths: avatarField.value ? [avatarField.value] : undefined,
            error: handleCoverError(),
            loading: false,
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
    }
};
