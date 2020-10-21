import React, { useEffect, useState }                                  from 'react';
import { Button, DropError, FilesUploader } from '@frontend/flib-react/lib/components';
import styled                                                          from 'styled-components';
import { imagesMetadataValidationSchema } from './validationSchema';

import { useTranslation } from 'react-i18next';
import '../../../shared/Translations/StylesForm';

import { useFormik }                from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { MergedAppState }           from '../../../index';
import { EventCreationCore }        from '../../../core/event_creation/EventCreationCore';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { getImgPath }               from '@frontend/core/lib/utils/images';
import { ColorPickers }             from '../../../components/ColorPickers';
import { DateMetadata }             from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { isEqual }                  from 'lodash';

interface StylesFormProps {
    uuid: string;
    dateId: string;
    initialValues: DateMetadata,
}

interface Styles {
    avatar: string;
    signatureColors: string[];
}

export const StylesForm: React.FC<StylesFormProps> = (props: StylesFormProps) => {
    const [ lastInitialValues, setLastInitialValues ] = useState<Styles>(null);
    const [ updatable, setUpdatable ] = useState<boolean>(false);
    const [ loadingImg, setLoadingImg ] = useState<boolean>(false);

    const dispatch = useDispatch();
    const [ t ] = useTranslation(['event_styles', 'validation', 'react_dropzone_errors']);

    const token = useSelector((state: MergedAppState): string => state.auth.token.value);
    const { lazyRequest: updateStyles, response: updateResponse } = useLazyRequest('dates.update', props.uuid);

    const formik = useFormik<Styles>({
        initialValues: {
            avatar: props.initialValues.avatar,
            signatureColors: props.initialValues.signature_colors,
        },
        validationSchema: imagesMetadataValidationSchema,
        onSubmit: (values) => void updateStyles([
                token,
                props.dateId,
                {
                    metadata: {
                        ...props.initialValues,
                        avatar: values.avatar,
                        signature_colors: values.signatureColors,
                    }
                }
            ], {
            force: true
            }),
    });

    const [ preview, setPreview ] = useState('');

    const uploadImages = (files: File[], previews: string[]) => {
        const formData = new FormData();
        setLoadingImg(true);
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
        formik.setValues({
            avatar: '',
            signatureColors: [],
        });
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

            return t('validation:' + formik.errors.avatar);
        }
    };

    useEffect(() => {
        if (formik.values.avatar) {
            setPreview(getImgPath(formik.values.avatar));
            setLoadingImg(false);
        }
    }, [formik.values.avatar]);

    useDeepEffect(() => {
        if (updateResponse.data) {
            dispatch(PushNotification('Successfuly updated', 'success'));
        }
    }, [updateResponse.data]);

    useDeepEffect(() => {
        setUpdatable(formik.isValid && !isEqual(formik.values, lastInitialValues));
    }, [formik.values, lastInitialValues, formik.isValid]);

    useEffect(() => {
        setLastInitialValues({
            avatar: props.initialValues.avatar,
            signatureColors: props.initialValues.signature_colors,
        })
    }, [props.initialValues]);

    useEffect(() => {
        if(updateResponse.error) {
            dispatch(PushNotification('Update failed. Please retry.', 'error'));
        }
    }, [updateResponse.error, dispatch]);

    return (
        <Form onSubmit={formik.handleSubmit}>
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
            value={formik.values.signatureColors as [string, string]}
            onChange={(colors) => formik.setFieldValue('signatureColors', colors)}/>
            <Button
                variant={updatable ? 'primary' : 'disabled'}
                type='submit'
                title={t('save_changes')}/>
        </Form>
    );
};

const Form = styled.form`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;
