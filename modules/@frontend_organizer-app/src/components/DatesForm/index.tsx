import React                                             from 'react';
import { useFormik }                                     from 'formik';
import * as yup                                          from 'yup';
import styled                                            from 'styled-components';
import { CustomDatePicker, CustomTimePicker, TextInput } from '@frontend/flib-react/lib/components';
import Button                                            from '@frontend/flib-react/lib/components/button';
import * as validators                                   from './validators';
import STEPS                                             from '../../screens/CreateEvent/enums';

const dateSchema = yup.object().shape({
  location: validators.location,
  dates: validators.dates
});
type FormValues = yup.InferType<typeof dateSchema>;

const initialValues: FormValues = { dates: [{
  start: { date: new Date(), time: new Date() },
  end: { date: new Date(), time: new Date() }
}], location: '' };

interface Props {
  setStep: (step: number) => void;
}

const DatesForm = ({ setStep }: Props) => {
  const formik = useFormik({
    initialValues,
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
      setStep(STEPS.ticketCategories);
    },
    validationSchema: dateSchema

  });
  return (
    <StyledForm onSubmit={formik.handleSubmit}>
      {formik.values.dates && formik.values.dates.map((c, idx) => (
        <React.Fragment key={`Dates-${idx}`}>
          <div className='line field'>
            <CustomDatePicker
              selected={formik.values.dates[idx].start.date}
              dateFormat={'iii, MMM do, yyyy'}
              placeholder='Pick a date'
              label='Event Start'
              onChange={(d: Date) => {/* need to remove element at idx and insert the new one */}}
              name='startDate'
            />
            <CustomTimePicker
              selected={formik.values.dates[idx].start.time}
              dateFormat={'h:mm aa'}
              label='Start Time'
              placeholder='Pick start time'
              onChange={(d: Date) => {/* need to remove element at idx and insert the new one */}}
              name='startTime'
            />
          </div>
          <div className='line field'>
          <CustomDatePicker
            selected={formik.values.dates[idx].end.date}
            minDate={formik.values.dates[idx].start.date}
            dateFormat={'iii, MMM do, yyyy'}
            placeholder='Pick a date'
            label='Event End'
            onChange={(d: Date) => {/* need to remove element at idx and insert the new one */}}
            name='endDate'
          />
          <CustomTimePicker
            selected={formik.values.dates[idx].end.time}
            dateFormat={'h:mm aa'}
            label='End Time'
            placeholder='Pick end time'
            onChange={(d: Date) => {/* need to remove element at idx and insert the new one */}}
            name='endTime'
          />
          </div>
        </React.Fragment>
      ))}
      <Button title='Add dates' variant='secondary' onClick={() => {
        formik.setFieldValue('dates', formik.values.dates.push(
          { start: { date: new Date(), time: new Date() }, end: { date: new Date(), time: new Date() }}
        ))}}
      />
      <TextInput
        className='field'
        label='Location'
        placeholder='Type an address'
        error={!!(formik.getFieldMeta('location').touched && formik.getFieldMeta('location').error) ? true : undefined}
        errormessage={formik.getFieldMeta('location').error}
        value={formik.values.location}
        onChange={formik.handleChange}
        name='location'
      />

      <Button variant='primary' type='submit' title='Validate'/>
    </StyledForm>
  );
};

const StyledForm = styled.form`
  width: 100%;
  .field {
    margin: 24px 0;
  }
  .line {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
`;

export default DatesForm;
