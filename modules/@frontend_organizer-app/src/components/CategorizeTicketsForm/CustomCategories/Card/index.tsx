import React from 'react';
import { Button } from "@frontend/flib-react/lib/components/button";
import { Container, Line} from "../../style";

interface Props {
  formik: any;
  index: number;
  validation: string[];
  setValidation: (state: React.SetStateAction<string[]>) => void;
  steps: number[];
  setSteps: (state: React.SetStateAction<number[]>) => void;

}

function Card({ formik, index, steps, setSteps, validation, setValidation}: Props): JSX.Element {
  const edit = () => {
    const newValidation = [...validation];
    newValidation[index] = 'false';
    setValidation(newValidation);
  };

  return (
    <>
      <Container>
        <Line>
          <h2>{formik.values.dates[index].name}</h2>
          {steps[index] === 0 && <span className='edit' onClick={() => edit()}>EDIT</span>}
        </Line>
        <h3>Dates:</h3>
        <p>{formik.values.dates[index].dates.map((d: any, idx: number, array: any[]) => (
          idx === array.length - 1 ? d.eventDate : `${d.eventDate}, `
        ))}</p>
      </Container>
      { index === validation.length - 1 && index === formik.values.dates.length - 1 && steps[index] === 0 && (
        <>
          <Button title='Create new Tickets' variant='secondary' onClick={() =>
            formik.setFieldValue('dates', [...formik.values.dates, {
              name: '',
              dates: [],
            }])}
          />
          <Button type='button' title='Confirm Categories' variant='secondary' onClick={() => {
            const newValidation = validation.map(v => (v === 'true' ? 'completing' : v));
            const newSteps = steps.map(s => (s === 0 ? 1 : s));
            setValidation(newValidation);
            setSteps(newSteps);
          }}
          />
        </>
      )}
    </>
  );
};


export default Card;
