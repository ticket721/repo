import React from 'react';
import { Button } from "@frontend/flib-react/lib/components/button";

import { Container, Line } from "../../style";


interface Props {
  formik: any;
  index: number;
  validation: string[];
  setValidation: (state: React.SetStateAction<string[]>) => void;
}

function Card({ formik, index, validation, setValidation }: Props): JSX.Element {
  const edit = () => {
    const newValidation = [...validation];
    newValidation[index] = 'false';
    setValidation(newValidation);
  };

  return (
    <>
      <Container>
        { formik.values.global[index].price > 0 && formik.values.global[index].quantity > 0 ? (
          <>
            <Line>
              <h2>{formik.values.global[index].name}</h2>
              <span className='edit' onClick={() => edit()}>EDIT</span>
            </Line>
            <h3>{formik.values.global[index].price}€</h3>
            <p>{formik.values.global[index].quantity} pass avaliable</p>
          </>
        ) : (
          <>
            <Line>
              <h2>{formik.values.global[index].name}</h2>
              <p className='warning'>Category is incomplete&nbsp;&nbsp;
                <span className='edit' onClick={() => edit()}>EDIT</span>
              </p>
            </Line>
            <h3>{formik.values.global[index].price}€
              {formik.values.global[index].price <= 0 && <span className='warning'>&nbsp;&nbsp;x</span>}
            </h3>
            <p>{formik.values.global[index].quantity} pass avaliable
              {formik.values.global[index].quantity <= 0 && <span className='warning'>&nbsp;&nbsp;x</span>}
            </p>
          </>
        )
        }
        <p>Sales: {formik.values.global[index].salesStart.toDateString()} - {formik.values.global[index].salesStart.toDateString()}</p>
      </Container>
      { index === validation.length - 1 && index === formik.values.global.length - 1 && (
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
  )
}


export default Card;
