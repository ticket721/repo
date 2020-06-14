import React from 'react';
import { Button, SelectInput, TextInput } from '@frontend/flib-react/lib/components';

import { Container } from './style';

interface Props {
  formik: any;
  index: number;
  state: string;
}

function Prices({ formik, index, state }: Props) {
  const options = [
    ...(formik.values.dates[index].dates.map((dateItem: any) => ({ label: dateItem.eventDate, value: dateItem.eventDate}))),
    {value: 'All dates', label: 'All dates'}
  ];
  const [values, setValues] = React.useState<({label: string, value: string}[])[]>([[]]);
  const [prices, setPrices] = React.useState<number[]>([0]);
  const add = () => {
    setPrices([...prices, 0]);
    setValues([...values, []]);
  };

  return (
    <Container>
      { prices.map((price: number, i) => (
        <React.Fragment key={`price-by-date-${i}`}>
          <SelectInput
            className={'select'}
            options={options}
            multiple
            placeholder={'select dates to apply price to'}
            value={values[i]}
            onChange={(date: any, e: any) => {
              const newDates = [...values];
              if (e.action === 'remove-value') {
                const newValues = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => {
                    if (e.removedValue.value === d.eventDate) {
                      return ({...d, price: 0});
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
                  d => ({...d, price: 0})
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
                      return ({...d, price});
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
            label={'price'}
            name={'price'}
            type={'number'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newDates = formik.values.dates[index].dates.map(
                // @ts-ignore
                d => values[i].find(v => v.value === d.eventDate) ? ({...d, price: e.target.value}) : (d)
              );
              formik.setFieldValue(`dates[${index}].dates`, newDates);
              // @ts-ignore
              const newPrices = [...prices];
              newPrices[i] = parseFloat(e.target.value);
              setPrices(newPrices);
            }}
            placeholder={'price of one ticket'}
            value={price}
            error={state === 'check' && price < 0 ?
              'Price cannot be negative' : undefined
            }
          />
        </React.Fragment>
        )
      )}
      <Button type='button' title='Add prices' variant='secondary' onClick={add} />
    </Container>
  );
}

export default Prices;
