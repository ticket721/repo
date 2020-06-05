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
  const getDisplayDate = (d: Date) => `${d.toDateString()}, ${d.getHours()}:${d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes()}`;
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
    validationSchema: dateSchema

  });

  return (
    <>
      {(validation === 'true' && (
        <Card>
          <span className='edit' onClick={() => setValidation('false')}>EDIT</span>
          <h2>{`Date${formik.values.dates.length > 1 ? 's' : ''}:`}</h2>
          {formik.values.dates.map((d: any, i: number) => (
            <span key={`finalDate-${i}`}>
              {
                d.start.final && d.end.final &&
                `${getDisplayDate(d.start.final)} - ${getDisplayDate(d.end.final)}`
              }
            </span>
          ))}
          <h2>Location:</h2>
          <span>{formik.values.location}</span>
        </Card>
      )) || ((validation === 'false' || validation === 'check') && (
        <StyledForm onSubmit={formik.handleSubmit}>
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

          <Button variant='primary' type='submit' title='Continue'/>
        </StyledForm>
      ))}
    </>
  );
};

const Card = styled.div`
  min-width: 550px;
  border-radius: ${props => props.theme.defaultRadius};
  padding: ${props => props.theme.biggerSpacing};
  background-color: ${props => props.theme.darkerBg}; 
  display: flex;
  flex-direction: column;
  margin: 10px 0 40px 0;  
  
  div {
    margin: 0;
  }
  h2 {
    text-transform: uppercase;
    font-size: 15px;
    margin: 16px 0;
  }
  h3 {
    font-weight: normal;
    font-size: 15px;
    margin: 0 0 3px 0;
  }
  p {
   color: ${props => props.theme.textColorDarker};
   font-size: 14px;
   margin: 0;
  }
  .warning {
     color: ${props => props.theme.warningColor.hex};
     text-align: right;
     margin: 16px 0;
   }
  .edit {
    color: ${props => props.theme.textColorDarker};
    text-align: right;
    font-weight: bold;
    text-decoration: underline;
    font-size: 10px;
    cursor: pointer;
  }
`;

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
  button {
    margin: 45px 0;
    outline: none;
  }
`;

export default DatesForm;
