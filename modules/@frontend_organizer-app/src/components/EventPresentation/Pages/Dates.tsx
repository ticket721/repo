import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { Button, TextInput } from '@frontend/flib-react/lib/components/';
import {
  EventsCreateDatesConfiguration,
} from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';

import { Events } from '../../../types/UserEvents';

import { datesConfigValidationSchema } from './validationSchema';

interface Props {
  userEvent: Events;
  currentDate: string | undefined;
}
const initialValues: EventsCreateDatesConfiguration = { dates: []};


const Dates = ({ userEvent, currentDate }: Props) => {
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

export default Dates;
