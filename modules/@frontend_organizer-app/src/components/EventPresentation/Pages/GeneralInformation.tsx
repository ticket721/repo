import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { EventsCreateTextMetadata } from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { TextInput, Textarea, Tags, Button } from "@frontend/flib-react/lib/components";

import { Events } from "../../../types/UserEvents";
import { formatDateForDisplay } from "../../../utils/functions";

import { textMetadataValidationSchema } from './validationSchema';
import './locales';

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}

const GeneralInformation = ({ userEvent, currentDate }: Props) => {
  const date = userEvent.dates.find((d) => formatDateForDisplay(d.startDate) === currentDate);
  const initialValues: EventsCreateTextMetadata = {
    name: userEvent.name,
    description: date.description,
    tags: date.tags,
  };
  const [ inputTag, setInputTag ] = React.useState('');
  const [ t ] = useTranslation(['general_infos', 'validation']);
  const formik = useFormik({
    initialValues,
    onSubmit: (values: EventsCreateTextMetadata) => {
      alert(JSON.stringify(values, null, 2));
    },
    validationSchema: textMetadataValidationSchema,
  });

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
        onFocus={(v) => {}}
        onBlur={(e: any) => {}}
        error={
          computeError('tags')
          && t(computeError('tags'))
        }
      />
      <Button variant='primary' type='submit' title='Validate'/>
    </Form>
  );
};

const Form = styled.form`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;

export default GeneralInformation;
