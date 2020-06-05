import React, { useState }               from 'react';
import { useFormik }                                from 'formik';
import * as yup                                     from 'yup';
import styled                                       from 'styled-components';
import { validationSchema }                         from './validationSchema';
import { Textarea, TextInput, Tags, FilesUploader, TagsList } from '@frontend/flib-react/lib/components';
import Button                                       from '@frontend/flib-react/lib/components/button';
import STEPS from '../../screens/CreateEvent/enums';

// import Vibrant from 'node-vibrant/lib/vibrant';
// tslint:disable-next-line:no-var-requires
// const ColorThief = require('colorthief');

type FormValues = yup.InferType<typeof validationSchema>;

const initialValues: FormValues = { name: '', description: '', cover: {
  name: '', size: 0, height: 0, width: 0, previewUrl: ''
  }, tags: [] };

interface Props {
  setStep: (step: number) => void;
}

const GeneralInfoForm = ({ setStep }: Props) => {
  const [validation, setValidation] = React.useState('false');
  const [edit, setEdit] = React.useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const formik = useFormik({
    initialValues,
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
      setValidation('true');
      if (!edit) {
        setStep(STEPS.dates);
      }
    },
    validationSchema,
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
    <>
      {(validation === 'true' && (
        <Card>
          <div className='line'>
            <h2>{formik.values.name}</h2>
            <span className='edit' onClick={() => {
                setValidation('false');
                setEdit(true);
            }}>EDIT</span>
          </div>
          <p>{formik.values.description}</p>
          <img src={formik.values.cover.previewUrl} alt='cover' />
          <TagsList tags={formik.values.tags.map((t, i) => ({id: i, label: t}))}/>
        </Card>
      )) || (validation === 'false' && (
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
                const newTags = v ? v.map((c: {value: string, label: string}) => c.value) : [];
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
      ))}
    </>
  );
};

const Card = styled.div`
  min-width: 550px;
  border-radius: ${props => props.theme.defaultRadius};
  padding: ${props => props.theme.biggerSpacing};
  background-color: ${props => props.theme.darkerBg}; 
  display: flex;
  flex-direction: column;
  margin: 10px 0 40px 0;  

  div {
    margin: 0 !important;
  }
  h2 {
    text-transform: uppercase;
    font-size: 15px;
    margin: 0 0 16px 0 !important;
  }
  h3 {
    font-weight: normal;
    font-size: 15px;
    margin: 0 0 3px 0 !important;
  }
  p {
   color: ${props => props.theme.textColorDarker};
   font-size: 14px;
   margin: 0 !important;
   white-space: pre-wrap;
  }
  img {
    max-width: 500px;
  }
  .line {
      display: flex;
    justify-content: space-between;
    align-items: center;
    && > * {
      width: 49%;
    }
  }
  .edit {
    color: ${props => props.theme.textColorDarker};
    text-align: right;
    margin: 0 0 16px 0 !important;
    font-weight: bold;
    text-decoration: underline;
    font-size: 10px;
    cursor: pointer;
  }
`;

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
