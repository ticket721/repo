import React from 'react';
import { Button, SelectInput, TextInput } from '@frontend/flib-react/lib/components';

import { Container } from './style';

interface Props {
  formik: any;
  index: number;
  state: string;
}

function Quantities({ formik, index, state }: Props) {
  const options = [
    ...(formik.values.dates[index].dates.map((dateItem: any) => ({ label: dateItem.eventDate, value: dateItem.eventDate}))),
    {value: 'All dates', label: 'All dates'}
  ];
  const [values, setValues] = React.useState<({label: string, value: string}[])[]>([[]]);
  const [quantities, setQuantities] = React.useState<number[]>([0]);
  const add = () => {
    setQuantities([...quantities, 0]);
    setValues([...values, []]);
  };

  return (
    <Container>
      { quantities.map((quantity: number, i) => (
        <React.Fragment key={`quantity-by-date-${i}`}>
          <SelectInput
            className={'select'}
            options={options}
            multiple
            placeholder={'select dates to apply quantity to'}
            value={values[i]}
            onChange={(date: any, e: any) => {
              const newDates = [...values];
              if (e.action === 'remove-value') {
                const newValues = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => {
                    if (e.removedValue.value === d.eventDate) {
                      return ({...d, quantity: 0});
                    } else {
                      return d;
                    }
                  }
                );
                newDates[i] = values[i].filter((c: any) => c.value !== e.removedValue.value);
                setValues(newDates);
                formik.setFieldValue(`dates[${index}].dates`, newValues);

              } else if (e.action === 'clear') {
                const newValues = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => ({...d, quantity: 0})
                );
                newDates[i] = [];
                setValues(newDates);
                formik.setFieldValue(`dates[${index}].dates`, newValues);

              } else if (e.action === 'select-option') {
                if (e.option.value === 'All dates') {
                  newDates[i] = formik.values.dates[index].dates.map((d: any) =>
                    ({ label: d.eventDate, value: d.eventDate})
                  );
                  setValues(newDates);
                  return;
                }
                newDates[i] = [...values[i], {
                  label: e.option.value,
                  value: e.option.value,
                }];
                const newValues = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => {
                    if (newDates[i].find(v => v.value === d.eventDate)) {
                      return ({...d, quantity});
                    } else {
                      return d;
                    }
                  }
                );
                setValues(newDates);
                formik.setFieldValue(`dates[${index}].dates`, newValues);
              }
            }}
          />
          <TextInput
            label={'quantity'}
            name={'quantity'}
            type={'number'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newDates = formik.values.dates[index].dates.map(
                // @ts-ignore
                d => values[i].find(v => v.value === d.eventDate) ? ({...d, quantity: e.target.value}) : (d)
              );
              formik.setFieldValue(`dates[${index}].dates`, newDates);
              const newQuantities = [...quantities];
              newQuantities[i] = parseFloat(e.target.value);
              setQuantities(newQuantities);
            }}
            placeholder={'quantity of one ticket'}
            value={quantity}
            error={state === 'check' && quantity < 0 ?
              'Price cannot be negative' : undefined
            }
          />
        </React.Fragment>
        )
      )}
      <Button type='button' title='Add quantities' variant='secondary' onClick={add} />
    </Container>
  );
}

export default Quantities;
