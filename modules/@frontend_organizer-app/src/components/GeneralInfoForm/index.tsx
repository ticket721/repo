import React, { useEffect, useState }               from 'react';
import { useFormik }                                from 'formik';
import * as yup                                     from 'yup';
import styled                                       from 'styled-components';
import * as validators                              from './validators';
import { Textarea, TextInput, Tags, FilesUploader } from '@frontend/flib-react/lib/components';
import Button                                       from '@frontend/flib-react/lib/components/button';
import STEPS from '../../screens/CreateEvent/enums';
// import Vibrant from 'node-vibrant/lib/vibrant';
// tslint:disable-next-line:no-var-requires
// const ColorThief = require('colorthief');

const generalSchema = yup.object().shape({
  name: validators.name,
  description: validators.description,
  cover: validators.cover,
  tags: validators.tags,
});
type FormValues = yup.InferType<typeof generalSchema>;

const initialValues: FormValues = { name: '', description: '', cover: {
  name: '', size: 0, height: 0, width: 0, previewUrl: ''
  }, tags: [] };

interface Props {
  setStep: (step: number) => void;
}

const GeneralInfoForm = ({ setStep }: Props) => {
  const [currentTag, setCurrentTag] = useState('');
  const formik = useFormik({
    initialValues,
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
      setStep(STEPS.dates);
    },
    validationSchema: generalSchema
  });

  /*
    Vibrant.from(srcForImage).maxColorCount(3).getPalette(
      (err, palette) => console.log(palette)
    );
  */
  /*
    const palette = ColorThief.getPalette(srcForImage, 3);
    console.log('Palette : ', palette);
  */

  return (
    <StyledForm onSubmit={formik.handleSubmit}>
      <TextInput
        className='field'
        name='name'
        label='Name'
        placeholder='Name of the event'
        type='text'
        onChange={formik.handleChange}
        value={formik.values.name}
        error={!!(formik.getFieldMeta('name').touched && formik.getFieldMeta('name').error) ?
          formik.getFieldMeta('name').error : undefined
        }
      />
      <Textarea
        className='field'
        name='description'
        label='Description'
        placeholder='Breifly describe your event'
        maxChar={1000}
        onChange={formik.handleChange}
        value={formik.values.description}
        error={!!(formik.getFieldMeta('description').touched && formik.getFieldMeta('description').error) ?
          formik.getFieldMeta('description').error : undefined
        }
      />
      <FilesUploader
        browseLabel='or Browse to choose a file'
        dragDropLabel='Drag and drop an image'
        noFilesMsg='Cover is required'
        uploadRecommandations='Use a high-quality image. Recommended size 2000x1000px (2:1)'
        setCover={(cover: any) => formik.setFieldValue('cover', cover)}
        hasErrors={(formik.getFieldMeta('cover').touched && formik.values.cover.previewUrl === '')}
        errorMessage={formik.values.cover.previewUrl === '' ? 'Cover is required' : "Can't upload your file"}
      />
      <Tags
        name='Tags'
        label='Tags'
        placeholder='Add a tag, then press enter'
        onInputChange={(v) => setCurrentTag(v)}
        inputValue={currentTag}
        value={formik.values.tags ? formik.values.tags.map(c => ({ label: c, value: c})) : []}
        onKeyDown={(e, v) => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            formik.values.tags.push(v);
            setCurrentTag('');
          }
        }}
        error={!!(formik.getFieldMeta('tags').touched && formik.getFieldMeta('tags').error) ?
          formik.getFieldMeta('tags').error : undefined
        }
        onChange={(v, e) => {
          if (e.action === 'remove-value') {
            const newTags = v.map((c: {value: string, label: string}) => c.value);
            formik.setFieldValue('tags', newTags);
            setCurrentTag('');
          }
          if (e.action === 'clear') {
            formik.setFieldValue('tags', []);
            setCurrentTag('');
          }
        }}
        onBlur={(value) => {}}
      />
      <Button variant='primary' type='submit' title='Continue'/>
    </StyledForm>
  );
};

const StyledForm = styled.form`
  width: 100%;
  && .field {
    margin: 24px 0;
  }
  && button {
    margin: 45px 0;
    outline: none;
  }
`;

export default GeneralInfoForm;
