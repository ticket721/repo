import React from "react";
import styled from "styled-components";
import { Button, TextInput, SelectInput } from "@frontend/flib-react/lib/components";

import Card from './Card';
import Completion from './Completion';

interface Props {
  formik: any;
  validation: string[];
  setValidation: (state: React.SetStateAction<string[]>) => void;
}

const userDates = [new Date(), new Date('2020-05-17T03:24:00'), new Date('2020-05-20T03:24:00'), new Date('2020-05-23T03:24:00')];

function CustomCategories ({ formik, validation, setValidation }: Props): JSX.Element {
  const options = userDates.map((d) => ({ label: d.toDateString(), value: d.toDateString()}));
  const [steps, setSteps] = React.useState([0]);

  return (
    <Container>
      <Text>Create categories</Text>
      {formik.values.dates.map((elem: any, i: number) => {
        const validateTicket = () => {
          const newValidation = [...validation];
          const newSteps = [...steps];
          newSteps[i] = 0;
          if (
            formik.values.dates[i].name !== ''
            && formik.values.dates[i].dates.length > 0
          ) {
            if (validation[i] === 'completing') {
              newSteps[i] = 1;
              setSteps(newSteps);
            }
            newValidation[i] = 'true';
          } else {
            newValidation[i] = 'check';
          }
          setSteps(newSteps);
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
            )) || (validation[i] === 'completing' && (
              <Completion formik={formik} index={i} validateTicket={validateTicket} state={validation[i]}/>
            ))|| (validation[i] !== 'true' && validation[i] !== 'completing' && (
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
                      const newDates = formik.values.dates[i].dates.filter(
                        (c: any) => c.eventDate !== e.removedValue.value
                      );
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

export default CustomCategories;
