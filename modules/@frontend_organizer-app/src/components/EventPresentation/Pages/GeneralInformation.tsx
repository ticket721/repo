import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { TextInput, Textarea, Tags, Button } from "@frontend/flib-react/lib/components";
import { AppState } from "@frontend/core/src/redux/ducks";
import { useRequest } from "@frontend/core/lib/hooks/useRequest";
// import { PushNotification } from "@frontend/core/lib/redux/ducks/notifications";
import { useLazyRequest } from "@frontend/core/lib/hooks/useLazyRequest";
import { PushNotification } from "@frontend/core/lib/redux/ducks/notifications";
import { useDeepEffect } from "@frontend/core/lib/hooks/useDeepEffect";

import {
  DatesSearchResponseDto
} from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';

import { Events } from "../../../types/UserEvents";
import { formatDateForDisplay } from "../../../utils/functions";

import { textMetadataValidationSchema } from './validationSchema';
import './locales';

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}

const GeneralInformation = ({ userEvent, currentDate }: Props) => {
  const current = userEvent.dates.find((d) => formatDateForDisplay(d.startDate) === currentDate);
  const dispatch = useDispatch();
  const [uuidRequest] = React.useState(v4());
  const [uuidUpdate] = React.useState(v4());
  const token = useSelector((state: AppState): string => state.auth.token.value);
  const { response } = useRequest<DatesSearchResponseDto>(
    {
      method: 'dates.search',
      args: [
        token,
        {
          id: {
            $eq: current.id,
          }
        },
      ],
      refreshRate: 50,
    },
    uuidRequest
  );
  const { lazyRequest, response: updateResponse } = useLazyRequest('dates.update', uuidUpdate);

  const [ inputTag, setInputTag ] = React.useState('');
  const [ t ] = useTranslation(['general_infos', 'validation']);
  const formik = useFormik({
    initialValues: { name: '', description: '', tags: [], avatar: '', signature_colors: []},
    onSubmit: (values) => {
      lazyRequest([token, current.id, { metadata: values }]);
    },
    validationSchema: textMetadataValidationSchema,
  });

  useDeepEffect(() => {
    if (updateResponse.error) {
      dispatch(PushNotification(updateResponse.error, 'error'));
    }
    if (!updateResponse.error && !updateResponse.loading && updateResponse.called) {
      dispatch(PushNotification('Success', 'success'));
    }

  }, [updateResponse]);

  useDeepEffect(() => {
    if (!response.loading && response.error === undefined) {
      formik.setValues({...response.data.dates[0].metadata});
    }
  }, [response]);

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

  const computeError = (field: string) => formik.touched[field] && formik.errors[field] ?
    'validation:' + formik.errors[field] : '';

  if (response.loading || formik.values === undefined) {
    return <div>loading...</div>;
  }
  if (response.error) {
    return <div>error</div>;
  }

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
