import React from "react";
import styled from "styled-components";
import { Button, TextInput, CustomDatePicker, Checkbox } from "@frontend/flib-react/lib/components";

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
        const edit = () => {
          const newValidation = [...validation];
          newValidation[i] = 'false';
          setValidation(newValidation);
        };

        return (
          <React.Fragment key={`global-${i}`}>
            {
              validation[i] === 'true' ? (
                <>
                  <Card>
                    { formik.values.global[i].price > 0 && formik.values.global[i].quantity > 0 ? (
                      <>
                        <Line>
                          <h2>{formik.values.global[i].name}</h2>
                          <span className='edit' onClick={() => edit()}>EDIT</span>
                        </Line>
                        <h3>{formik.values.global[i].price}€</h3>
                        <p>{formik.values.global[i].quantity} pass avaliable</p>
                      </>
                    ) : (
                      <>
                        <Line>
                          <h2>{formik.values.global[i].name}</h2>
                          <p className='warning'>Category is incomplete&nbsp;&nbsp;
                            <span className='edit' onClick={() => edit()}>EDIT</span>
                          </p>
                        </Line>
                        <h3>{formik.values.global[i].price}€
                          {formik.values.global[i].price <= 0 && <span className='warning'>&nbsp;&nbsp;x</span>}
                        </h3>
                        <p>{formik.values.global[i].quantity} pass avaliable
                          {formik.values.global[i].quantity <= 0 && <span className='warning'>&nbsp;&nbsp;x</span>}
                        </p>
                      </>
                      )
                    }
                    <p>Sales: {formik.values.global[i].salesStart.toDateString()} - {formik.values.global[i].salesStart.toDateString()}</p>
                  </Card>
                  { i === validation.length - 1 && i === formik.values.global.length - 1 && (
                    <Button type='button' title='Create new Global Passes' variant='secondary' onClick={() =>
                      formik.setFieldValue('global', [...formik.values.global, {
                        name: '',
                        price: 0,
                        quantity: 0,
                        salesStart: new Date(),
                        salesEnd: new Date(),
                        resalesStart: new Date(),
                        resalesEnd: new Date(),
                        resales: false,
                      }])}
                    />
                  )}
                </>
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
  width: 500px;
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

export default Global;
