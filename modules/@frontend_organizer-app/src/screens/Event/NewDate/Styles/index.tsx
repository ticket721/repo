import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { DropError, FilesUploader} from '@frontend/flib-react/lib/components';
import { AppState }                from '@frontend/core/src/redux/ducks';
import { PushNotification }        from '@frontend/core/lib/redux/ducks/notifications';
import {
    ImageEntity
}                                  from '@common/sdk/lib/@backend_nest/libs/common/src/images/entities/Image.entity';
import { getImgPath }              from '@frontend/core/lib/utils/images';
import '../../../../shared/Translations/StylesForm';
import '../../../../shared/Translations/global';
import { EventCreationCore }       from '../../../../core/event_creation/EventCreationCore';
import { ColorPickers }            from '../../../../components/ColorPickers';

interface StylesProps {
    formik: any;
}

export const Styles: React.FC<StylesProps> = ({ formik }) => {
    const [ t ] = useTranslation(['event_creation_styles', 'react_dropzone_errors', 'validation']);
    const dispatch = useDispatch();
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const [ preview, setPreview ] = React.useState('');

    const uploadImages = (files: File[], previews: string[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        EventCreationCore.uploadImages(token, formData, {})
            .then((ids: ImageEntity[]) => {
                formik.setFieldTouched('avatar');
                formik.setFieldValue('avatar', ids[0].id);
            }).catch((error) => {
            dispatch(PushNotification(t('error_notifications:' + error.message), 'error'));
        });
    };

    const removeImage = () => {
        formik.setFieldValue('avatar', '');
        formik.setFieldValue('signature_colors', []);
        setPreview('');
    };

    const handleDropErrors = (errors: DropError[]) => {
        let finalError: string = '';
        for (const err of errors[0].errorCodes) {
            finalError = finalError.concat(' ' + t('react_dropzone_errors:' + err));
        }

        formik.setFieldError('avatar', finalError);
    };

    const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

    React.useEffect(() => {
        if (formik.values.avatar) {
            setPreview(getImgPath(formik.values.avatar));
        }
    }, [formik.values.avatar]);

    return (
        <>
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
                    computeError('avatar') &&
                    t(computeError('avatar'))
                }
            />
            <ColorPickers
                srcImage={preview}
                colors={formik.values.signature_colors}
                onColorsChange={(colors) => formik.setFieldValue('signature_colors', colors)}/>
        </>
    )
};

