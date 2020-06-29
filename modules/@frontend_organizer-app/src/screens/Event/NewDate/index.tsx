import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { useParams, useHistory } from 'react-router';

import { Button, Textarea, TextInput, Tags } from '@frontend/flib-react/lib/components';
import { AppState } from '@frontend/core/src/redux/ducks';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import {
    DatesSearchResponseDto
} from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import {
    DatesCreateResponseDto
} from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesCreateResponse.dto';

import { completeDateValidation } from './validationSchema';
import '../../../shared/Translations/generalInfoForm';
import '../../../shared/Translations/global';
import DatesForm from '../../../components/DatesForm';

const NewDate = () => {
    const [ t ] = useTranslation(['general_infos', 'notify', 'global']);
    const history = useHistory();
    const { groupId, dateId } = useParams();
    const [ inputTag, setInputTag ] = React.useState('');
    const dispatch = useDispatch();
    const [uuidRequest] = React.useState(v4());
    const [uuiCreate] = React.useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const { response } = useRequest<DatesSearchResponseDto>(
      {
          method: 'dates.search',
          args: [
              token,
              {
                  id: {
                      $eq: dateId,
                  }
              },
          ],
          refreshRate: 50,
      },
      uuidRequest
    );
    const { lazyRequest: createDate, response: createResponse } = useLazyRequest<DatesCreateResponseDto>('dates.create', uuiCreate);

    const formik = useFormik({
        initialValues: {
            eventBegin: new Date(),
            eventEnd: new Date(),
            location: { lon: 0, lat: 0, label: ''},
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
        if (!createResponse.error && !createResponse.loading) {
            dispatch(PushNotification(t('success'), 'success'));
            history.push(`/${groupId}/date/${createResponse.data.date.id}`);
        }
    }, [createResponse]);

    useDeepEffect(() => {
        if (!response.loading && !response.error && response.data
        ) {
            formik.setValues({
                eventBegin: new Date(response.data.dates?.[0]?.timestamps?.event_begin),
                eventEnd: new Date(response.data.dates?.[0]?.timestamps?.event_end),
                location: {
                    ...response.data.dates?.[0]?.location?.location,
                    label: response.data.dates?.[0]?.location?.location_label,
                },
                ...response.data.dates?.[0]?.metadata
            });
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
                } />
              <DatesForm
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

      & .date-line-field {
          margin-bottom: ${props => props.theme.biggerSpacing};
      }

      & .date-container {
          display: flex;
          justify-content: space-between;

          & > div:first-child {
              width: calc(65% - ${props => props.theme.biggerSpacing});
              margin-right: ${props => props.theme.biggerSpacing};
          }

          & > div:last-child {
              width: 35%;
          }
      }
    }
`;

export default NewDate;
