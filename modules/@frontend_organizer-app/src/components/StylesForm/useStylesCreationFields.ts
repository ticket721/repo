import { FilesUploaderProps, ColorPickerProps, DropError } from '@frontend/flib-react/lib/components';
import { useField } from 'formik';

import '@frontend/core/lib/components/ToastStacker/locales';
import { useTranslation }              from 'react-i18next';
import './locales';

import { useEffect, useState } from 'react';
import Vibrant from 'node-vibrant';
import { ColorResult } from 'react-color';

export const useStylesCreationFields = (parentField?: string, onCreation?: boolean): {
    avatarProps: FilesUploaderProps,
    primaryColorProps: ColorPickerProps,
    secondaryColorProps: ColorPickerProps,
} => {
    const [ t ] = useTranslation(['event_styles', 'react_dropzone_errors']);

    const [ presetColors, setPresetColors ] = useState<string[]>([]);

    const [ reader ] = useState<FileReader>(new FileReader());

    const [ avatarField, avatarMeta, avatarHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}avatar`);
    const [ primaryColorField,, primaryColorHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}signatureColors[0]`);
    const [ secondaryColorField,, secondaryColorHelper ] = useField<string>(`${parentField ? parentField + '.' : ''}signatureColors[1]`);

    const uploadImages = async (files: File[], previews: string[]) => {
        if (onCreation) {
            reader.readAsDataURL(files[0]);
        }

        avatarHelper.setValue(previews[0]);
        generatePresetColors(previews[0]);
    };

    const removeImage = () => {
        avatarHelper.setTouched(true);
        avatarHelper.setValue('');
        primaryColorHelper.setValue('');
        secondaryColorHelper.setValue('');
        setPresetColors([]);

        if (onCreation) {
            localStorage.removeItem('event-creation-image-content-type');
            localStorage.removeItem('event-creation-image');
        }
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
        if (onCreation) {
            reader.onloadend = () => {
                localStorage.setItem('event-creation-image-content-type', (reader.result as string).split(',')[0].match(/(image\/.+);/)[1]);
                localStorage.setItem('event-creation-image', (reader.result as string).split(',')[1] as string);
            };
        }
    // eslint-disable-next-line
    }, [onCreation]);

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
