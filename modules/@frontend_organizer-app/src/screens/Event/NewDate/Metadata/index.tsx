import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextInput, Tags, RichText } from '@frontend/flib-react/lib/components';
import '../../../../shared/Translations/generalInfoForm';
import '../../../../shared/Translations/global';

interface MetadataProps {
    formik: any;
}

export const Metadata: React.FC<MetadataProps> = ({ formik }) => {
    const [ t ] = useTranslation(['general_infos', 'validation']);
    const [ inputTag, setInputTag ] = React.useState('');

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

    const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

    return (
            <>
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
                    maxChar={10000}
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
                    onChange={(tags: string[]) => formik.setFieldValue('tags', tags)}
                    onFocus={(v) => { console.log('focus');}}
                    onBlur={(e: any) => { console.log('focus');}}
                    error={
                        computeError('tags')
                        && t(computeError('tags'))
                    }
                />
            </>
    )
};

