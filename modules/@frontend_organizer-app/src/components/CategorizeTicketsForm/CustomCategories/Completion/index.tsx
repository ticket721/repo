import React from 'react';
import { Button , TextInput, SelectInput } from "@frontend/flib-react/lib/components";

import { Container } from "../../style";

interface Props {
  formik: any;
  index: number;
  validateTicket: () => void;
  state: string;
}

function Completion({ formik, index, validateTicket, state}: Props): JSX.Element {
  const [prices, setPrices] = React.useState([[]]);

  return (
    <Container>
      <h2>{formik.values.dates[index].name}</h2>
      <h3>Dates:</h3>
      <p>{formik.values.dates[index].dates.map((d: any, idx: number, array: any[]) => (
        idx === array.length - 1 ? d.eventDate : `${d.eventDate}, `
      ))}</p>
      <SelectInput
        options={[
          ...(formik.values.dates[index].dates.map((d: any) => ({ label: d.eventDate, value: d.eventDate}))),
          {value: 'alldates', label: 'All dates'}
        ]}
        multiple
        placeholder={'select dates to apply price to'}
        value={prices[index].map(p => ({ label: p, value: p}))}
        onChange={(d: any, e: any) => {
          if (e.action === 'remove-value') {
            const newDates = prices[index].filter((c: any) => c.value !== e.removedValue.value);
            prices[index] = newDates;
          } else if (e.action === 'clear') {
            prices[index] = [];
          } else if (e.action === 'select-option') {
            const newDates = [...prices[index], {
              label: e.option.value,
              value: e.option.value,
            }];
            // @ts-ignore
            prices[index] = newDates;
          }
        }}
      />
      <TextInput
        label={'price'}
        name={`dates[${index}].price`}
        onChange={formik.handleChange}
        placeholder={'price of one ticket'}
        value={formik.values.dates[index].price}
        error={state === 'check' && formik.values.dates[index].price < 0 ?
          'Price cannot be negative' : undefined
        }
        type={'number'}
      />
      <Button type='button' title='Create' variant='secondary' onClick={validateTicket} />
    </Container>
  );
}

export default Completion;
