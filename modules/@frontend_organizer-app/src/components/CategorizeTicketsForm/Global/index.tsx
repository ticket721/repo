import React from 'react';
import styled from 'styled-components';
import { Button, TextInput, CustomDatePicker, Checkbox } from '@frontend/flib-react/lib/components';

import Card from './Card';

interface Props {
  formik: any;
  validation: string[];
  setValidation: (state: React.SetStateAction<string[]>) => void;
}

function Global({ formik, validation, setValidation }: Props): JSX.Element {

  return (
    <Container>
      <Text>Informations</Text>
      {formik.values.global.map((elem: any, i: number) => {
        return (
          <React.Fragment key={`global-${i}`}>
            {
              validation[i] === 'true' ? (
                <Card
                  formik={formik}
                  index={i}
                  validation={validation}
                  setValidation={setValidation}
                />
              ) : (
                <FormContainer>
                  <TextInput
                    label={'name'}
                    name={`global[${i}].name`}
                    onChange={formik.handleChange}
                    placeholder={'name of the category'}
                    value={formik.values.global[i].name}
                    error={validation[i] === 'check' && formik.values.global[i].name === '' ?
                      'Name is required' : undefined
                    }
                  />
                  <Line>
                    <TextInput
                      label={'price'}
                      name={`global[${i}].price`}
                      onChange={formik.handleChange}
                      placeholder={'price of one ticket'}
                      value={formik.values.global[i].price}
                      error={validation[i] === 'check' && formik.values.global[i].price < 0 ?
                        'Price cannot be negative' : undefined
                      }
                      type={'number'}
                    />
                    <TextInput
                      label={'quantity'}
                      name={`global[${i}].quantity`}
                      onChange={formik.handleChange}
                      placeholder={'quantity of tickets in this category'}
                      value={formik.values.global[i].quantity}
                      error={validation[i] === 'check' && formik.values.global[i].quantity < 0 ?
                        'Quantity cannot be negative' : undefined
                      }
                      type={'number'}
                    />
                  </Line>
                  <Line>
                    <CustomDatePicker
                      selected={formik.values.global[i].salesStart}
                      dateFormat={'iii, MMM do, yyyy'}
                      placeholder='Pick a date'
                      label='Sales start'
                      onChange={(e) => {
                        formik.setFieldValue(`global[${i}].salesStart`, e)
                      }}
                      name={`global[${i}].salesStart`}
                    />
                    <CustomDatePicker
                      selected={formik.values.global[i].salesEnd}
                      minDate={formik.values.global[i].salesStart}
                      dateFormat={'iii, MMM do, yyyy'}
                      placeholder='Pick a date'
                      label='Sales end'
                      onChange={(e) => {
                        formik.setFieldValue(`global[${i}].salesEnd`, e)
                      }}
                      name={`global[${i}].salesEnd`}
                    />
                  </Line>
                  <Checkbox label={'Allow resale'} name={`global[${i}].resales`}
                            onChange={(b, n) => formik.setFieldValue(`global[${i}].resales`, b)}/>
                  {formik.values.global[i].resales === true && (
                    <Line>
                      <CustomDatePicker
                        selected={formik.values.global[i].resalesStart}
                        dateFormat={'iii, MMM do, yyyy'}
                        placeholder='Pick a date'
                        label='Resales start'
                        onChange={(e) => {
                          formik.setFieldValue(`global[${i}].resalesStart`, e)
                        }}
                        name={`global[${i}].resalesStart`}
                      />
                      <CustomDatePicker
                        selected={formik.values.global[i].resalesEnd}
                        minDate={formik.values.global[i].resalesStart}
                        dateFormat={'iii, MMM do, yyyy'}
                        placeholder='Pick a date'
                        label='Resales end'
                        onChange={(e) => {
                          formik.setFieldValue(`global[${i}].resalesEnd`, e)
                        }}
                        name={`global[${i}].resalesEnd`}
                      />
                    </Line>
                  )}
                  <Button type='button' title='Create' variant='secondary' onClick={() => {
                    const newValidation = [...validation];
                    if (
                      formik.values.global[i].name !== ''
                      && formik.values.global[i].price >= 0
                      && formik.values.global[i].quantity >= 0
                    ) {
                      newValidation[i] = 'true';
                    } else {
                      newValidation[i] = 'check';
                    }
                    setValidation(newValidation);
                  }} />
                </FormContainer>
              )
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

const Line = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    && > * {
      width: 49%;
    }
`;

export default Global;
