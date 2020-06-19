import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { Button, TextInput, CustomDatePicker, CustomTimePicker} from "@frontend/flib-react/lib/components/";

import { formatDateForDisplay } from "../../../utils/functions";
import { Events } from "../../../types/UserEvents";
import {
  EventsCreateDatesConfiguration,
} from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';

import { datesConfigValidationSchema } from "./validationSchema";

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}
const initialValues: EventsCreateDatesConfiguration = { dates: []};


const Dates = ({ userEvent, currentDate }: Props) => {
  const date = userEvent.dates.find((d) => formatDateForDisplay(d.startDate) === currentDate);
  const formik = useFormik({
    initialValues,
    onSubmit: (values: EventsCreateDatesConfiguration) => {
      alert(JSON.stringify(values, null, 2));
    },
    validationSchema: datesConfigValidationSchema,
  });
  const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

  return (
    <Form onSubmit={formik.handleSubmit}>
      <TextInput
        className={'date-line-field'}
        label='Name'
        placeholder='Provide a name'
        {...formik.getFieldProps('name')}
        error={computeError('name')} />
      {/*<div className={'date-line-field date-container'}>*/}
      {/*  <CustomDatePicker*/}
      {/*    label={'Event Start'}*/}
      {/*    name={'startDate'}*/}
      {/*    dateFormat={'iii, MMM do, yyyy'}*/}
      {/*    placeholder={'Pick a start date'}*/}
      {/*    minDate={new Date()}*/}
      {/*    selected={formik.values.eventBegin}*/}
      {/*    onChange={(date: Date) => onDateChange('eventBegin', date)}*/}
      {/*    error={computeError('eventBegin')}/>*/}
      {/*  <CustomTimePicker*/}
      {/*    label={'Start Time'}*/}
      {/*    name={'startTime'}*/}
      {/*    dateFormat={'hh:mm aa'}*/}
      {/*    placeholder={'Pick a start time'}*/}
      {/*    selected={formik.values.eventBegin}*/}
      {/*    onChange={(date: Date) => onTimeChange('eventBegin', date)}*/}
      {/*    error={computeError('eventBegin')}/>*/}
      {/*</div>*/}
      {/*<DateEndContainer*/}
      {/*  className={'date-line-field date-container'}*/}
      {/*  disabled={!formik.values.eventBegin}>*/}
      {/*  <CustomDatePicker*/}
      {/*    disabled={!formik.values.eventBegin}*/}
      {/*    label={'Event End'}*/}
      {/*    name={'endDate'}*/}
      {/*    dateFormat={'iii, MMM do, yyyy'}*/}
      {/*    placeholder={'Pick a end date'}*/}
      {/*    minDate={formik.values.eventBegin}*/}
      {/*    selected={formik.values.eventEnd}*/}
      {/*    onChange={(date: Date) => onDateChange('eventEnd', date)}*/}
      {/*    error={computeError('eventEnd')}/>*/}
      {/*  <CustomTimePicker*/}
      {/*    disabled={!formik.values.eventBegin}*/}
      {/*    label={'End Time'}*/}
      {/*    name={'endTime'}*/}
      {/*    dateFormat={'hh:mm aa'}*/}
      {/*    placeholder={'Pick a end time'}*/}
      {/*    minTime={formik.values.eventBegin}*/}
      {/*    selected={formik.values.eventEnd}*/}
      {/*    onChange={(date: Date) => onTimeChange('eventEnd', date)}*/}
      {/*    error={computeError('eventEnd')}/>*/}
      {/*</DateEndContainer>*/}
      {/*<TextInput*/}
      {/*  className={'date-line-field'}*/}
      {/*  label='Location'*/}
      {/*  name='location'*/}
      {/*  icon={'pin'}*/}
      {/*  placeholder='Provide a location'*/}
      {/*  value={formik.values.location.label}*/}
      {/*  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange(e.target.value)}*/}
      {/*  error={computeError('location', 'label')} />*/}
      {/*<ButtonsContainer>*/}
      {/*  {*/}
      {/*    !newDate ?*/}
      {/*      <Button*/}
      {/*        title='Delete this date'*/}
      {/*        variant={'danger'}*/}
      {/*        onClick={props.delete}*/}
      {/*      /> :*/}
      {/*      <div/>*/}
      {/*  }*/}
      {/*  <div className={'sub-container'}>*/}
      {/*    <Button*/}
      {/*      title='Cancel'*/}
      {/*      variant={'secondary'}*/}
      {/*      onClick={newDate ? props.delete : props.cancel}*/}
      {/*    />*/}
      {/*    <Button*/}
      {/*      type='submit'*/}
      {/*      title='Confirm Date'*/}
      {/*      variant={*/}
      {/*        formik.isValid &&*/}
      {/*        JSON.stringify(formik.values) !== JSON.stringify(checkedInitialValues) ?*/}
      {/*          'primary' :*/}
      {/*          'disabled'*/}
      {/*      }*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</ButtonsContainer>*/}
      <Button variant='primary' type='submit' title='Validate'/>
    </Form>
  )
};

const Form = styled.form`
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
`;

const DateEndContainer = styled.div<{ disabled: boolean }>`
    opacity: ${props => props.disabled ? '0.3' : '1'};
`;

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: space-between;

    & > button {
        width: 30%;
    }

    .sub-container {
        width: 50%;
        display: flex;

        & > button:first-child {
            flex: 1;
            margin-right: ${props => props.theme.regularSpacing};
        }

        & > button:last-child {
            flex: 2;
        }
    }
`;

export default Dates;
