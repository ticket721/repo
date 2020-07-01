import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { useParams, useHistory } from 'react-router';

import {Button, Textarea, TextInput, Tags, DropError, FilesUploader} from '@frontend/flib-react/lib/components';
import { AppState } from '@frontend/core/src/redux/ducks';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { ImageEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/images/entities/Image.entity';
import { getImgPath }               from '@frontend/core/lib/utils/images';
import {
    DatesCreateResponseDto
} from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesCreateResponse.dto';

import { EventCreationCore }        from '../../../core/event_creation/EventCreationCore';
import { ColorPickers }             from '../../../components/ColorPickers';
import '../../../shared/Translations/generalInfoForm';
import '../../../shared/Translations/StylesForm';
import '../../../shared/Translations/global';
import DateForm from '../../../components/DateForm';

import { completeDateValidation } from './validationSchema';

const NewDate = () => {
    const [ t ] = useTranslation(['general_infos', 'notify', 'global', 'event_creation_styles']);
    const history = useHistory();
    const { groupId, eventId } = useParams();
    const [ inputTag, setInputTag ] = React.useState('');
    const dispatch = useDispatch();
    const [uuiCreate] = React.useState(v4());
    const [uuiAdd] = React.useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const { lazyRequest: createDate, response: createResponse } = useLazyRequest<DatesCreateResponseDto>('dates.create', uuiCreate);
    const { lazyRequest: addDate, response: addResponse } = useLazyRequest<DatesCreateResponseDto>('events.addDates', uuiAdd);

    const formik = useFormik({
        initialValues: {
            eventBegin: new Date(),
            eventEnd: new Date(),
            location: { lon: null, lat: null, label: ''},
            name: '',
            description: '',
            tags: [],
            avatar: '',
            signature_colors: []
        },
        onSubmit: (values) => {
            createDate([token, {
                group_id: groupId,
                metadata: {
                    name: values.name,
                    description: values.description,
                    tags: values.tags,
                    avatar: values.avatar,
                    signature_colors: values.signature_colors,
                },
                timestamps: {
                    event_begin: values.eventBegin,
                    event_end: values.eventEnd,
                },
                location: {
                    location_label: values.location.label,
                    location: {
                        lon: values.location.lon,
                        lat: values.location.lat,
                    }
                }}]);
        },
        validationSchema: completeDateValidation,
    });

    useDeepEffect(() => {
        if (createResponse.error) {
            dispatch(PushNotification(t(createResponse.error), 'error'));
        }
    }, [createResponse.error]);
    useDeepEffect(() => {
        if (createResponse.data) {
            addDate([token, eventId, { dates: [createResponse.data.date.id]}])
        }
    }, [createResponse.data]);

    useDeepEffect(() => {
        if (addResponse.error) {
            dispatch(PushNotification(t(createResponse.error), 'error'));
        }
    }, [addResponse.error]);
    useDeepEffect(() => {
        if (addResponse.data) {
            dispatch(PushNotification(t('success'), 'success'));
            history.push(`/${groupId}/date/${createResponse.data.date.id}`);
        }
    }, [addResponse.data]);


    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLElement>, tag: string) => {
        if(!inputTag) {
            if (formik.values.tags?.length === 5) {
                e.preventDefault();
            }

            return;
        }

        switch (e.key) {
            case 'Enter':
            case 'Tab':
                if (!formik.touched.tags) {
                    formik.setFieldTouched('tags');
                }
                if (formik.values.tags.indexOf(tag) > -1) {
                    formik.setFieldError('tags', 'tag_already_added');
                } else if (inputTag.length < 3) {
                    formik.setFieldError('tags', 'tag_too_short');
                } else if (inputTag.length > 16) {
                    formik.setFieldError('tags', 'tag_too_long');
                } else {
                    setInputTag('');
                    formik.setFieldValue('tags', [
                        ...formik.values.tags,
                        tag,
                    ]);
                }
                e.preventDefault();
        }
    };

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

    const renderFormActions = () => (<Button variant='primary' type='submit' title={t('validate')}/>);

    return (
        <Form onSubmit={formik.handleSubmit}>
            <div className={'form-container'}>
                <TextInput
                    name='name'
                    label={t('name_label')}
                    placeholder={t('name_placeholder')}
                    {...formik.getFieldProps('name')}
                    error={
                        computeError('name')
                        && t(computeError('name'))
                    }
                />
                <Textarea
                    name='description'
                    label={t('description_label')}
                    placeholder={t('description_placeholder')}
                    maxChar={1000}
                    {...formik.getFieldProps('description')}
                    error={
                        computeError('description')
                        && t(computeError('description'))
                    }
                />
                <Tags
                    name='tags'
                    label={t('tags_label')}
                    placeholder={t('tags_placeholder')}
                    currentTagsNumber={formik.values?.tags ? formik.values?.tags.length : 0}
                    maxTags={5}
                    inputValue={inputTag}
                    onInputChange={(val: string) => setInputTag(val)}
                    onKeyDown={onTagsKeyDown}
                    value={formik.values.tags}
                    onChange={(tags: string[]) => formik.setFieldValue('tags', tags)}
                    onFocus={(v) => { console.log('focus');}}
                    onBlur={(e: any) => { console.log('focus');}}
                    error={
                        computeError('tags')
                        && t(computeError('tags'))
                    }
                />
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
                <DateForm
                    formik={formik}
                    formActions={renderFormActions}
                />
              </div>
          </Form>
    )
};

const Form = styled.form`
    width: 100%;
    display: flex;
    justify-content: center;

    .form-container {
      @media (min-width: 1024px) {
        max-width: 600px;
      }
      width: 100%;
      min-width: 375px;
      > * {
        margin-bottom: 35px
      }
    }
`;

export default NewDate;
