import React from 'react';
import { Button } from "@frontend/flib-react/lib/components";

import { Prices, Quantities, Sales, Resales } from './Fields';
import { Container } from "../../style";

interface Props {
  formik: any;
  index: number;
  validateTicket: () => void;
  state: string;
}

function Completion({ formik, index, validateTicket, state}: Props): JSX.Element {
  return (
    <Container>

      <h2>{formik.values.dates[index].name}</h2>
      <h3>Dates:</h3>
      <p>{formik.values.dates[index].dates.map((d: any, idx: number, array: any[]) => (
        idx === array.length - 1 ? d.eventDate : `${d.eventDate}, `
      ))}</p>

      <Prices formik={formik} index={index} state={state} />
      <Quantities formik={formik} index={index} state={state} />
      <Sales formik={formik} index={index} state={state} />
      <Resales formik={formik} index={index} state={state} />

      <Button type='button' title='Create' variant='secondary' onClick={validateTicket} />

    </Container>
  );
}

export default Completion;
