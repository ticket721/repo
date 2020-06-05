import React                                             from 'react';
import { useFormik }                                     from 'formik';
import * as yup                                          from 'yup';
import styled                                            from 'styled-components';
import { CustomDatePicker, CustomTimePicker, TextInput } from '@frontend/flib-react/lib/components';
import Button                                            from '@frontend/flib-react/lib/components/button';
import { validationSchema }                              from './validationSchema';
import STEPS                                             from '../../screens/CreateEvent/enums';

type FormValues = yup.InferType<typeof validationSchema>;

const initialValues: FormValues = { dates: [{
  start: { date: new Date(), time: new Date(), final: new Date() },
  end: { date: new Date(), time: new Date(), final: new Date() }
}], location: '' };

interface Props {
  setStep: (step: number) => void;
}

const DatesForm = ({ setStep }: Props) => {
  const [validation, setValidation] = React.useState('false');
  const mergeDate = (date: Date, time: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(),
    time.getHours(), time.getMinutes(), time.getSeconds());
  const formik = useFormik({
    initialValues,
    onSubmit: values => {
      const dateValidation = formik.values.dates.map(d => d.start.final > d.end.final);
      if (dateValidation.find(e => e === true)) {
          setValidation('check');
          return;
      }
      alert(JSON.stringify(values, null, 2));
      setValidation('true');
      setStep(STEPS.ticketCategories);
    },
    validationSchema,

  });

  return (
    <>
      <StyledForm onSubmit={formik.handleSubmit}>
        <Warning>Once you click 'Continue' you will not be able to edit this category</Warning>
        {formik.values.dates && formik.values.dates.map((c, idx) => (
        <React.Fragment key={`Dates-${idx}`}>
          {formik.values.dates.length > 1 && <h3>Date {idx + 1}:</h3>}
          <div className='line field'>
            <CustomDatePicker
              selected={formik.values.dates[idx].start.date}
              dateFormat={'iii, MMM do, yyyy'}
              placeholder='Pick a date'
              label='Event Start'
              onChange={(d: Date) => {
                const newDates = formik.values.dates.map(date => ({
                  ...date,
                  start: {
                    date: date.start.date,
                    time: date.start.time,
                    final: mergeDate(
                      date.start.date, date.start.time
                    ),
                  }
                }));
                newDates[idx].start.date = d;
                newDates[idx].start.final = mergeDate(
                  newDates[idx].start.date, newDates[idx].start.time
                );
                formik.setFieldValue(`dates`, newDates);
              }}
              name='startDate'
            />
            <CustomTimePicker
              selected={formik.values.dates[idx].start.time}
              dateFormat={'h:mm aa'}
              label='Start Time'
              placeholder='Pick start time'
              onChange={(d: Date) => {
                const newDates = formik.values.dates.map(date => ({
                  ...date,
                  start: {
                    date: date.start.date,
                    time: date.start.time,
                    final: mergeDate(
                      date.start.date, date.start.time
                    ),
                  }
                }));
                newDates[idx].start.time = d;
                newDates[idx].start.final = mergeDate(
                  newDates[idx].start.date, newDates[idx].start.time
                );
                formik.setFieldValue(`dates`, newDates);
              }}
              name='startTime'
              error={validation === 'check' &&
              formik.values.dates[idx].start.final > formik.values.dates[idx].end.final ?
                  'Start date should be before end date' : undefined
              }
            />
          </div>
          <div className='line field'>
            <CustomDatePicker
              selected={formik.values.dates[idx].end.date}
              minDate={formik.values.dates[idx].start.date}
              dateFormat={'iii, MMM do, yyyy'}
              placeholder='Pick a date'
              label='Event End'
              onChange={(d: Date) => {
                const newDates = formik.values.dates.map(date => ({
                  ...date,
                  end: {
                    date: date.end.date,
                    time: date.end.time,
                    final: mergeDate(
                      date.end.date, date.end.time
                    ),
                  }
                }));
                newDates[idx].end.date = d;
                newDates[idx].end.final = mergeDate(
                  newDates[idx].end.date, newDates[idx].end.time
                );
                formik.setFieldValue(`dates`, newDates);
              }}
              name='endDate'
            />
            <CustomTimePicker
              selected={formik.values.dates[idx].end.time}
              dateFormat={'h:mm aa'}
              label='End Time'
              placeholder='Pick end time'
              onChange={(d: Date) => {
                const newDates = formik.values.dates.map(date => ({
                  ...date,
                  end: {
                    date: date.end.date,
                    time: date.end.time,
                    final: mergeDate(
                      date.end.date, date.end.time
                    ),
                  }
                }));
                newDates[idx].end.time = d;
                newDates[idx].end.final = mergeDate(
                  newDates[idx].end.date, newDates[idx].end.time
                );
                formik.setFieldValue(`dates`, newDates);
              }}
              name='endTime'
            />
          </div>
        </React.Fragment>
        ))}
        <Button title='Add dates' variant='secondary' onClick={() => {
          formik.setFieldValue('dates', [...formik.values.dates,
            { start: { date: new Date(), time: new Date() }, end: { date: new Date(), time: new Date() }}
          ])}}
        />
        <TextInput
          className='field'
          label='Location'
          placeholder='Type an address'
          error={!!(formik.getFieldMeta('location').touched && formik.getFieldMeta('location').error) ?
            formik.getFieldMeta('location').error : undefined
          }
          value={formik.values.location}
          onChange={formik.handleChange}
          name='location'
        />

        <Button className='submit' variant='primary' type='submit' title='Continue'/>
      </StyledForm>
    </>
  );
};

const StyledForm = styled.form`
  min-width: 550px;
  .field {
    margin: 24px 0;
  }
  .line {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .submit {
    margin: 45px 0;
    outline: none;
  }
`;

const Warning = styled.h3`
    font-weight: normal;
    font-size: 15px;
    margin: 3px 0;
    color: ${props => props.theme.warningColor.hex};
`;

export default DatesForm;
