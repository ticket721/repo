import React, { useState }              from 'react';
import {
  Tags,
  ITag,
  Textarea,
  TextInput
}                                       from '@frontend/flib-react/lib/components';
import Button                           from '@frontend/flib-react/lib/components/button';
import { EventsCreateTextMetadata }     from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { textMetadataValidationSchema } from './validationSchema';
import { useAction }                    from '@frontend/core/lib/hooks/useActionSet';
import styled                           from 'styled-components';
import { useFormik }                    from 'formik';

const initialValues = {
    name: '',
    description: '',
    tags: [],
};

const GeneralInfoForm = () => {
    const [ inputTag, setInputTag ] = useState('');
    const action = useAction<EventsCreateTextMetadata>(
        '',
        'eventCreate',
        0,
        {
            initialValues,
            validationSchema: textMetadataValidationSchema,
        }
    );

    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLElement>, value: string) => {
        if(!inputTag || action.formik.values.tags?.length === 5) return;

        switch (e.key) {
            case 'Enter':
            case 'Tab':
                if(!action.formik.values.tags) {
                    setInputTag('');
                  action.formik.setFieldValue('tags', [{
                        label: value,
                         value,
                    }]);
                } else {
                    if (action.formik.values.tags.findIndex((tag: any) => tag.value === value) > -1) {
                      action.formik.setFieldError('tags', 'tag already added');
                    } else {
                        setInputTag('');
                      action.formik.setFieldValue('tags', [
                          ...action.formik.values.tags,
                          {
                              label: value,
                              value,
                          }
                        ]);
                    }
                }
                e.preventDefault();
        }
    };

    return (
        <Form onSubmit={action.formik.handleSubmit}>
            <TextInput
            name='name'
            label='Name'
            placeholder='Name of your event'
            onFocus={action.handleFocus}
            onChange={action.handleChange}
            onBlur={action.formik.handleBlur}
            value={action.formik.values.name}
            error={action.computeError('name')}
            />
            <Textarea
            name='description'
            label='Description'
            placeholder='Describe your event'
            maxChar={1000}
            onFocus={action.handleFocus}
            onChange={action.handleChange}
            onBlur={action.formik.handleBlur}
            value={action.formik.values.description}
            error={action.computeError('description')}
            />
            <Tags
            name='tags'
            value={action.formik.values.tags}
            inputValue={inputTag}
            label='Tags'
            onFocus={action.handleFocus}
            onChange={(val: ITag[]) => {
                if (val) {
                  action.formik.setFieldValue('tags', val);
                } else {
                  action.formik.setFieldValue('tags', []);
                }
            }}
            onBlur={action.formik.handleBlur}
            onInputChange={(val: string) => setInputTag(val)}
            onKeyDown={onTagsKeyDown}
            currentTagsNumber={action.formik.values.tags ? action.formik.values.tags.length : 0}
            maxTags={5}
            placeholder='tags'
            error={action.computeError('tags')}
            />
            <Button variant='primary' type='submit' title='Create Event'/>
        </Form>
    );
};

const Form = styled.form`
    > * {
        margin-bottom: 35px
    }
`;

export default GeneralInfoForm;
