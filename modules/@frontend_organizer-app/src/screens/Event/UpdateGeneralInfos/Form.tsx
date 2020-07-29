import React, { useEffect, useState }        from 'react';
import { Button, RichText, Tags, TextInput } from '@frontend/flib-react/lib/components';
import styled                                from 'styled-components';
import { textMetadataValidationSchema } from './validationSchema';

import { useTranslation } from 'react-i18next';
import './locales';

import { useFormik }                from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { MergedAppState }           from '../../../index';
import { DateMetadata }             from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }         from '@frontend/core/lib/redux/ducks/notifications';
import { isEqual }                  from 'lodash';

interface GeneralInfosFormProps {
    uuid: string;
    dateId: string;
    initialValues: DateMetadata,
}

interface GeneralInfos {
    name: string;
    description: string;
    tags: string[];
}

export const GeneralInfosForm: React.FC<GeneralInfosFormProps> = (props: GeneralInfosFormProps) => {
    const [ lastInitialValues, setLastInitialValues ] = useState<GeneralInfos>(null);
    const dispatch = useDispatch();
    const [ updatable, setUpdatable ] = useState<boolean>(false);
    const [ inputTag, setInputTag ] = useState('');
    const [ t ] = useTranslation(['update_general_infos', 'validation']);

    const token = useSelector((state: MergedAppState): string => state.auth.token.value);
    const { lazyRequest: updateGeneralInfos, response: updateResponse } = useLazyRequest('dates.update', props.uuid);

    const formik = useFormik<GeneralInfos>({
        initialValues: {
            name: props.initialValues.name,
            description:  props.initialValues.description,
            tags:  props.initialValues.tags,
        },
        validationSchema: textMetadataValidationSchema,
        onSubmit: (values) => {
            updateGeneralInfos([
                token,
                props.dateId,
                {
                    metadata: {
                        ...props.initialValues,
                        name: values.name,
                        description: values.description,
                        tags: values.tags,
                    }
                }
            ], {
                force: true
            });
        }
    });

    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLElement>, tag: string) => {
        if (!tag && formik.values.tags?.length === 5) {
            e.preventDefault();
            return;
        }

        switch (e.key) {
            case 'Enter':
            case 'Tab':
                if (!formik.touched.tags) {
                    formik.setFieldTouched('tags');
                }
                if (tag.length > 0) {
                    if (formik.values.tags.indexOf(tag) > -1) {
                        formik.setFieldError('tags', 'tag_already_added');
                    } else if (tag.length < 3) {
                        formik.setFieldError('tags', 'tag_too_short');
                    } else if (tag.length > 16) {
                        formik.setFieldError('tags', 'tag_too_long');
                    } else {
                        setInputTag('');
                        formik.setFieldValue('tags', [
                            ...formik.values.tags,
                            tag,
                        ]);
                    }
                    e.preventDefault();
                } else {
                    if (formik.values.tags.length === 0) {
                        formik.setFieldError('tags', 'tag_required');
                    }
                }
        }
    };

    const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

    useDeepEffect(() => {
        setUpdatable(formik.isValid && formik.values !== formik.initialValues);
    }, [formik.values, formik.initialValues, formik.isValid]);

    useDeepEffect(() => {
        if (updateResponse.data) {
            dispatch(PushNotification('Successfuly updated', 'success'));
        }
    }, [updateResponse.data]);

    useEffect(() => {
        if(updateResponse.error) {
            dispatch(PushNotification('Update failed. Please retry.', 'error'));
        }
    }, [updateResponse.error, dispatch]);

    useDeepEffect(() => {
        setUpdatable(formik.isValid && !isEqual(formik.values, lastInitialValues));
    }, [formik.values, lastInitialValues, formik.isValid]);

    useEffect(() => {
        setLastInitialValues({
            name: props.initialValues.name,
            description: props.initialValues.description,
            tags: props.initialValues.tags
        })
    }, [props.initialValues]);

    return (
        <Form onSubmit={formik.handleSubmit}>
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
            <RichText
              name='description'
              label={t('description_label')}
              placeholder={t('description_placeholder')}
              maxChar={900}
              value={formik.getFieldProps('description').value}
              onChange={(value) => formik.setFieldValue('description', value)}
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
                onChange={(tags: string[]) => {
                    if (tags.length === 0) {
                        formik.setFieldError('tags', 'tag_required');
                    }

                    formik.setFieldValue( 'tags', tags);
                }}
                error={
                    computeError('tags')
                    && t(computeError('tags'))
                }
            />
            <Button
                variant={updatable ? 'primary' : 'disabled'}
                loadingState={updateResponse.loading}
                type='submit'
                title={t('save_changes')}/>
        </Form>
    );
};

const Form = styled.form`
    > * {
        margin-bottom: 35px
    }
`;
