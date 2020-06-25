import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import {
  TextInput,
  Button,
  CustomDatePicker,
  CustomTimePicker, Textarea, Tags
} from '@frontend/flib-react/lib/components';
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

import { Events } from '../../../types/UserEvents';
import { formatDateForDisplay } from '../../../utils/functions';

import { completeDateValidation } from './validationSchema';
// need to replace it by 'global' file when T721-162 is merged
import '../../../shared/Translations/generalInfoForm';

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}


const AddDate = ({ userEvent, currentDate }: Props) => {
  const [ inputTag, setInputTag ] = React.useState('');
  const [ t ] = useTranslation(['general_infos', 'notify']);
  const current = userEvent.dates.find((d) => formatDateForDisplay(d.startDate) === currentDate);
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
            $eq: current.id,
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
        group_id: userEvent.group_id,
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
    }
  }, [createResponse]);

  useDeepEffect(() => {
    if (!response.loading && !response.error && response.data
    ) {
      formik.setValues({
        eventBegin: new Date(response.data.dates[0].timestamps.event_begin),
        eventEnd: new Date(response.data.dates[0].timestamps.event_end),
        location: {
          ...response.data.dates[0].location.location,
          label: response.data.dates[0].location.location_label,
        },
        ...response.data.dates[0].metadata
      });
    }
  }, [response]);


  const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';
  const onDateChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
    if (date.getTime() < Date.now()) {
      return;
    }

    const unchangedTime: number[] = [
      formik.values[dateType].getHours(),
      formik.values[dateType].getMinutes(),
    ];

    formik.setFieldValue(dateType, new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      ...unchangedTime
    ));

    if (dateType === 'eventBegin') {
      if (date.getTime() > formik.values.eventEnd.getTime()) {
        formik.setFieldValue('eventEnd', new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          ...unchangedTime
        ));
      }
    }
  };
  const onTimeChange = (dateType: 'eventBegin' | 'eventEnd', date: Date) => {
    if (date.getTime() < Date.now()) {
      return;
    }

    const unchangedDate: number[] = [
      formik.values[dateType].getFullYear(),
      formik.values[dateType].getMonth(),
      formik.values[dateType].getDate()
    ];

    formik.setFieldValue(dateType, new Date(
      unchangedDate[0],
      unchangedDate[1],
      unchangedDate[2],
      date.getHours(),
      date.getMinutes()
    ));
  };
  const onLocationChange = (location: string) => {
    formik.setFieldValue('location', {
      lon: 0,
      lat: 0,
      label: location,
    });
  };
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
        <div className={'date-line-field date-container'}>
          <CustomDatePicker
            label={'Event Start'}
            name={'startDate'}
            dateFormat={'iii, MMM do, yyyy'}
            placeholder={'Pick a start date'}
            minDate={new Date()}
            selected={formik.values.eventBegin}
            onChange={(date: Date) => onDateChange('eventBegin', date)}
            error={computeError('eventBegin')}/>
          <CustomTimePicker
            label={'Start Time'}
            name={'startTime'}
            dateFormat={'hh:mm aa'}
            placeholder={'Pick a start time'}
            selected={formik.values.eventBegin}
            onChange={(date: Date) => onTimeChange('eventBegin', date)}
            error={computeError('eventBegin')}/>
        </div>
        <div className={'date-line-field date-container'}>
          <CustomDatePicker
            label={'Event End'}
            name={'endDate'}
            dateFormat={'iii, MMM do, yyyy'}
            placeholder={'Pick a end date'}
            minDate={new Date()}
            selected={formik.values.eventEnd}
            onChange={(date: Date) => onDateChange('eventEnd', date)}
            error={computeError('eventEnd')}/>
          <CustomTimePicker
            label={'End Time'}
            name={'endTime'}
            dateFormat={'hh:mm aa'}
            placeholder={'Pick a end time'}
            selected={formik.values.eventEnd}
            onChange={(date: Date) => onTimeChange('eventEnd', date)}
            error={computeError('eventEnd')}/>
        </div>
        <TextInput
          className={'date-line-field'}
          label='Location'
          name='location'
          icon={'pin'}
          placeholder='Provide a location'
          value={formik.values.location.label}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange(e.target.value)}
          error={computeError('location')} />
        <Button variant='primary' type='submit' title={t('validate')}/>
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

      & > .date-line-field {
          margin-bottom: ${props => props.theme.biggerSpacing};
      }

      & > .date-container {
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

export default AddDate;
