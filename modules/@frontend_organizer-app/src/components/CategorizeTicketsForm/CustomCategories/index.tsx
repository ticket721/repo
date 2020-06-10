import React from 'react';
import styled from 'styled-components';
import { Button, TextInput, SelectInput } from '@frontend/flib-react/lib/components';

interface Props {
  formik: any;
  validation: string[];
  setValidation: (state: React.SetStateAction<string[]>) => void;
}

const userDates = [new Date(), new Date('2020-05-17T03:24:00'), new Date('2020-05-20T03:24:00'), new Date('2020-05-23T03:24:00')];

function CustomCategories ({ formik, validation, setValidation }: Props): JSX.Element {
  const options = userDates.map((d) => ({ label: d.toDateString(), value: d.toDateString()}));
  const [steps, setSteps] = React.useState([0]);
  const [prices] = React.useState([[]]);
  console.log(formik.values);

  return (
    <Container>
      <Text>Create categories</Text>
      {formik.values.dates.map((elem: any, i: number) => {
        console.log('price : ', prices);
        const edit = () => {
          const newValidation = [...validation];
          newValidation[i] = 'false';
          setValidation(newValidation);
        };
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
                <>
                  <Card>
                    <Line>
                      <h2>{formik.values.dates[i].name}</h2>
                      {steps[i] === 0 && <span className='edit' onClick={() => edit()}>EDIT</span>}
                    </Line>
                    <h3>Dates:</h3>
                    <p>{formik.values.dates[i].dates.map((d: any, idx: number, array: any[]) => (
                      idx === array.length - 1 ? d.eventDate : `${d.eventDate}, `
                    ))}</p>
                  </Card>
                  { i === validation.length - 1 && i === formik.values.dates.length - 1 && steps[i] === 0 && (
                    <>
                      <Button title='Create new Tickets' variant='secondary' onClick={() =>
                        formik.setFieldValue('dates', [...formik.values.dates, {
                          name: '',
                          dates: [],
                        }])}
                      />
                      <Button type='button' title='Confirm Categories' variant='secondary' onClick={() => {
                        const newValidation = validation.map(v => (v === 'true' ? 'complete' : v));
                        const newSteps = steps.map(s => (s === 0 ? 1 : s));
                        setValidation(newValidation);
                        setSteps(newSteps);
                      }}
                      />
                    </>
                  )}
                </>
            )) || (validation[i] === 'complete' && (
              <Card>
                <h2>{formik.values.dates[i].name}</h2>
                <h3>Dates:</h3>
                <p>{formik.values.dates[i].dates.map((d: any, idx: number, array: any[]) => (
                  idx === array.length - 1 ? d.eventDate : `${d.eventDate}, `
                ))}</p>
                <SelectInput
                  options={[
                    ...(formik.values.dates[i].dates.map((d: any) => ({ label: d.eventDate, value: d.eventDate}))),
                    {value: 'alldates', label: 'All dates'}
                  ]}
                  multiple
                  placeholder={'select dates to apply price to'}
                  value={prices[i].map(p => ({ label: p, value: p}))}
                  onChange={(d: any, e: any) => {
                    if (e.action === 'remove-value') {
                      const newDates = prices[i].filter((c: any) => c.value !== e.removedValue.value);
                      prices[i] = newDates;
                    } else if (e.action === 'clear') {
                      prices[i] = [];
                    } else if (e.action === 'select-option') {
                      const newDates = [...prices[i], {
                        label: e.option.value,
                        value: e.option.value,
                      }];
                      // @ts-ignore
                      prices[i] = newDates;
                    }
                  }}
                />
                <TextInput
                  label={'price'}
                  name={`dates[${i}].price`}
                  onChange={formik.handleChange}
                  placeholder={'price of one ticket'}
                  value={formik.values.dates[i].price}
                  error={validation[i] === 'check' && formik.values.dates[i].price < 0 ?
                    'Price cannot be negative' : undefined
                  }
                  type={'number'}
                />
                <Button type='button' title='Create' variant='secondary' onClick={validateTicket} />
              </Card>
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

const Card = styled.div`
  border-radius: ${props => props.theme.defaultRadius};
  padding: ${props => props.theme.biggerSpacing};
  background-color: ${props => props.theme.darkerBg};
  display: flex;
  flex-direction: column;
  margin: 10px 0;

  div {
    margin: 0 !important;
  }
  h2 {
    text-transform: uppercase;
    font-size: 15px;
    margin: 0 0 16px 0 !important;
  }
  h3 {
    font-weight: normal;
    font-size: 15px;
    margin: 0 0 3px 0 !important;
  }
  p {
   color: ${props => props.theme.textColorDarker};
   font-size: 14px;
   margin: 0 !important;
  }
  .warning {
     color: ${props => props.theme.warningColor.hex};
     text-align: right;
     margin: 0 0 16px 0 !important;
   }
  .edit {
    color: ${props => props.theme.textColorDarker};
    text-align: right;
    margin: 0 0 16px 0 !important;
    font-weight: bold;
    text-decoration: underline;
    font-size: 10px;
    cursor: pointer;
  }
`;

const FormContainer = styled.div`
  margin-bottom: 30px;
`;

const Text = styled.h2`
  margin: 0 0 20px 0 !important;
`;

const Line = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    && > * {
      width: 49%;
    }
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
