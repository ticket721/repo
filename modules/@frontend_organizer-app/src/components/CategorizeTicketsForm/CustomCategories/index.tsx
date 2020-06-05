import React from 'react';
import styled from 'styled-components';
import { Button, TextInput, SelectInput } from '@frontend/flib-react/lib/components';

import Card from './Card';
import Completion from './Completion';

import { Line } from '../style';

interface Props {
  formik: any;
  validation: string[];
  setValidation: (state: React.SetStateAction<string[]>) => void;
}

const userDates = [new Date(), new Date('2020-05-17T03:24:00'), new Date('2020-05-20T03:24:00'), new Date('2020-05-23T03:24:00')];

function CustomCategories ({ formik, validation, setValidation }: Props): JSX.Element {
  const options = userDates.map((d) => ({ label: d.toDateString(), value: d.toDateString()}));
  const [steps, setSteps] = React.useState([0]);
  console.log(formik.values);

  return (
    <Container>
      <Text>Create categories</Text>
      {formik.values.dates.map((elem: any, i: number) => {
        const validateTicket = () => {
          const newValidation = [...validation];
          if (
            formik.values.dates[i].name !== ''
            && formik.values.dates[i].dates.length > 0
          ) {
            if (validation[i] === 'complete') {
              const newStep = [...steps];
              newStep[i] = 1;
              setSteps(steps);
            }
            newValidation[i] = 'true';
          } else {
            newValidation[i] = 'check';
          }
          setValidation(newValidation);
        };

        return (
          <React.Fragment key={`dates-${i}`}>
            {(validation[i] === 'true' && (
                <Card
                  formik={formik}
                  setValidation={setValidation}
                  setSteps={setSteps}
                  validation={validation}
                  steps={steps}
                  index={i}
                />
            )) || (validation[i] === 'complete' && (
              <Completion formik={formik} index={i} validateTicket={validateTicket} state={validation[i]}/>
            ))|| (validation[i] !== 'true' && validation[i] !== 'complete' && (
              <FormContainer key={`dates-${i}`}>
                <TextInput
                  label={'name'}
                  name={`dates[${i}].name`}
                  onChange={formik.handleChange}
                  placeholder={'name of the category'}
                  value={formik.values.dates[i].name}
                  error={validation[i] === 'check' && formik.values.dates[i].name === '' ?
                    'Name is required' : undefined
                  }
                />
                <SelectInput
                  error={formik.values.dates[i].dates.length === 0 && validation[i] === 'check' ?
                    'You must select at least 1 date' : undefined
                  }
                  options={options}
                  multiple
                  placeholder={'select dates for your category'}
                  value={formik.values.dates[i].dates.map((c: any) => ({label: c.eventDate, value: c.eventDate}))}
                  onChange={(d: any, e: any) => {
                    if (e.action === 'remove-value') {
                      const newDates = formik.values.dates[i].dates.filter((c: any) => c.eventDate !== e.removedValue.value);
                      formik.setFieldValue(`dates[${i}].dates`, newDates);
                    } else if (e.action === 'clear') {
                      formik.setFieldValue(`dates[${i}].dates`, []);
                    } else if (e.action === 'select-option') {
                      // @ts-ignore
                      formik.setFieldValue(`dates[${i}].dates`, [...formik.values.dates[i].dates, {
                        eventDate: e.option.value,
                      }]);
                    }
                  }}
                />
                <Button type='button' title='Create' variant='secondary' onClick={validateTicket} />
              </FormContainer>
            ))
            }
          </React.Fragment>
        );
      })}
    </Container>
  );
}

const Container = styled.div`
  width: 550px;
  && > div > * {
    margin: 25px 0;
  }
  button {
    outline: none;
  }
`;

const FormContainer = styled.div`
  margin-bottom: 30px;
`;

const Text = styled.h2`
  margin: 0 0 20px 0 !important;
`;

/*
                <TextInput
                  label={'quantity'}
                  name={`dates[${i}].quantity`}
                  onChange={formik.handleChange}
                  placeholder={'quantity of tickets in this category'}
                  value={formik.values.dates[i].quantity}
                  error={validation[i] === 'check' && formik.values.dates[i].quantity < 0 ?
                    'Quantity cannot be negative' : undefined
                  }
                  type={'number'}
                />
                <CustomDatePicker
                  selected={formik.values.dates[i].salesStart}
                  dateFormat={'iii, MMM do, yyyy'}
                  placeholder='Pick a date'
                  label='Sales start'
                  onChange={(e) => {
                    formik.setFieldValue(`dates[${i}].salesStart`, e)
                  }}
                  name={`dates[${i}].salesStart`}
                />
                <CustomDatePicker
                  selected={formik.values.dates[i].salesEnd}
                  minDate={formik.values.dates[i].salesStart}
                  dateFormat={'iii, MMM do, yyyy'}
                  placeholder='Pick a date'
                  label='Sales end'
                  onChange={(e) => {
                    formik.setFieldValue(`dates[${i}].salesEnd`, e)
                  }}
                  name={`dates[${i}].salesEnd`}
                />
                <Checkbox label={'Allow resale'} name={`dates[${i}].resales`}
                          onChange={(b, n) => formik.setFieldValue(`dates[${i}].resales`, b)}/>
                {formik.values.dates[i].resales === true && (
                  <Line>
                    <CustomDatePicker
                      selected={formik.values.dates[i].resalesStart}
                      dateFormat={'iii, MMM do, yyyy'}
                      placeholder='Pick a date'
                      label='Resales start'
                      onChange={(e) => {
                        formik.setFieldValue(`dates[${i}].resalesStart`, e)
                      }}
                      name={`dates[${i}].resalesStart`}
                    />
                    <CustomDatePicker
                      selected={formik.values.dates[i].resalesEnd}
                      minDate={formik.values.dates[i].resalesStart}
                      dateFormat={'iii, MMM do, yyyy'}
                      placeholder='Pick a date'
                      label='Resales end'
                      onChange={(e) => {
                        formik.setFieldValue(`dates[${i}].resalesEnd`, e)
                      }}
                      name={`dates[${i}].resalesEnd`}
                    />
                  </Line>
                )}

 */

export default CustomCategories;
