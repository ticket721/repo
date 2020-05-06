import React                from 'react';
import { Field, useFormik } from 'formik';
import * as yup             from 'yup';
import * as validators         from './validators';
import { Textarea, TextInput } from '@frontend/flib-react/lib/components';
import Button                  from '@frontend/flib-react/lib/components/button';

const generalSchema = yup.object().shape({
  name: validators.name,
  description: validators.description,
  cover: validators.cover
});
type FormValues = yup.InferType<typeof generalSchema>;

const initialValues: FormValues = { name: '', description: '', cover: '' };

const GeneralInfoForm = () => {
  const formik = useFormik({
    initialValues,
    onSubmit: (values: FormValues): void => { console.log('request to create event'); console.log(values) },
    validationSchema: generalSchema

});
  return (
    <form onSubmit={formik.handleSubmit}>
      <TextInput name='name' label='Name' placeholder='Name of the event' onChange={formik.handleChange} value={formik.values.name}/>
      <Textarea name='descritpion' label='Description' placeholder='Describe your event in 1000 char' maxChar={1000} onChange={formik.handleChange} value={formik.values.description}/>
      <TextInput name='Cover' label='Cover' placeholder="Event's cover" type='file' accept='image/png, image/jpeg' onChange={formik.handleChange} value={formik.values.cover}/>

      <Button variant='primary' type='submit' title='Create Event'/>
    </form>
  );
};

export default GeneralInfoForm;
