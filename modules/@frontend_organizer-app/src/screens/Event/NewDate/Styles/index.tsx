import React, { useState } from 'react';
import { useTranslation }  from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { DropError, FilesUploader} from '@frontend/flib-react/lib/components';
import { AppState }                from '@frontend/core/src/redux/ducks';
import { PushNotification }        from '@frontend/core/lib/redux/ducks/notifications';
import { getImgPath }              from '@frontend/core/lib/utils/images';
import '../../../../shared/Translations/StylesForm';
import '../../../../shared/Translations/global';
import { EventCreationCore }       from '../../../../core/event_creation/EventCreationCore';
import { ColorPickers }            from '../../../../components/ColorPickers';

interface StylesProps {
    formik: any;
}

export const Styles: React.FC<StylesProps> = ({ formik }) => {
    const [ t ] = useTranslation(['event_styles', 'react_dropzone_errors', 'validation']);
    const dispatch = useDispatch();
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const [ loadingImg, setLoadingImg ] = useState<boolean>(false);
    const [ preview, setPreview ] = React.useState('');

    const uploadImages = (files: File[], previews: string[]) => {
        setLoadingImg(true);
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        EventCreationCore.uploadImages(token, formData, {})
            .then((urls: string[]) => {
                formik.setFieldTouched('avatar');
                formik.setFieldValue('avatar', urls[0]);
            }).catch((error) => {
            dispatch(PushNotification(t('error_notifications:' + error.message), 'error'));
        });
    };

    const removeImage = () => {
        formik.setFieldTouched('avatar');
        formik.setFieldValue('avatar', '');
        formik.setFieldValue('signature_colors', []);
        setPreview('');
    };

    const handleDropErrors = (errors: DropError[]) => {
        formik.setFieldError('avatar', 'react_dropzone_errors:' + errors[0].errorCodes[0]);
    };

    const handleCoverError = () => {
        if (formik.errors.avatar) {
            if (formik.errors.avatar.startsWith('react_dropzone_errors')) {
                return t(formik.errors.avatar);
            }

            if (formik.touched.avatar) {
                return t('validation:' + formik.errors.avatar);
            }
        }
    };

    React.useEffect(() => {
        if (formik.values.avatar) {
            setPreview(getImgPath(formik.values.avatar));
            setLoadingImg(false);
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
                error={handleCoverError()}
                loading={loadingImg}
            />
            <ColorPickers
                srcImage={preview}
                value={formik.values.signature_colors}
                onChange={(colors) => formik.setFieldValue('signature_colors', colors)}/>
        </>
    )
};

