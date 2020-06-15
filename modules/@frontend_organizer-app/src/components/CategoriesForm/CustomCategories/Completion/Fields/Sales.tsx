import React from 'react';
import { Button, SelectInput, CustomDatePicker } from '@frontend/flib-react/lib/components';
import { Line } from '../../../style';
import { Container } from './style';

interface Props {
  formik: any;
  index: number;
  state: string;
}

function Sales({ formik, index, state }: Props) {
  const options = [
    ...(formik.values.dates[index].dates.map((dateItem: any) => ({ label: dateItem.eventDate, value: dateItem.eventDate}))),
    {value: 'All dates', label: 'All dates'}
  ];
  const [values, setValues] = React.useState<({label: string, value: string}[])[]>([[]]);
  const [dates, setDates] = React.useState<({ start: Date, end: Date })[]>([{ start: new Date(), end: new Date()}]);
  const add = () => {
    setDates([...dates, { start: new Date(), end: new Date()}]);
    setValues([...values, []]);
  };

  return (
    <Container>
      { dates.map((date: { start: Date, end: Date }, i) => (
        <React.Fragment key={`sales-by-date-${i}`}>
          <SelectInput
            className={'select'}
            options={options}
            multiple
            placeholder={'select dates to apply sales dates to'}
            value={values[i]}
            onChange={(dat: any, e: any) => {
              const newDates = [...values]
              if (e.action === 'remove-value') {
                const newValues = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => {
                    if (e.removedValue.value === d.eventDate) {
                      return ({...d, salesStart: undefined, salesEnd: undefined});
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
                  d => ({...d, salesStart: undefined, salesEnd: undefined})
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
                      return ({...d, salesStart: date.start, salesEnd: date.end });
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
          <Line>
            <CustomDatePicker
              selected={date.start}
              dateFormat={'iii, MMM do, yyyy'}
              placeholder='Pick a date'
              label='Sales start'
              onChange={(e) => {
                const newDates = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => values[i].find(v => v.value === d.eventDate) ? ({...d, salesStart: e}) : (d)
                );
                formik.setFieldValue(`dates[${index}].dates`, newDates);
                const newValues = [...dates];
                newValues[i].start = e;
                setDates(newValues);
              }}
              name={`dates[${i}].salesStart`}
            />
            <CustomDatePicker
              selected={date.end}
              minDate={date.start}
              dateFormat={'iii, MMM do, yyyy'}
              placeholder='Pick a date'
              label='Sales end'
              onChange={(e) => {
                const newDates = formik.values.dates[index].dates.map(
                  // @ts-ignore
                  d => values[i].find(v => v.value === d.eventDate) ? ({...d, salesEnd: e}) : (d)
                );
                formik.setFieldValue(`dates[${index}].dates`, newDates);
                const newValues = [...dates];
                newValues[i].end = e;
                setDates(newValues);
              }}
              name={`dates[${i}].salesEnd`}
            />
          </Line>
        </React.Fragment>
        )
      )}
      <Button type='button' title='Add sales dates' variant='secondary' onClick={add} />
    </Container>
  );
}

export default Sales;
