import React, { useState }                 from 'react';
import { ITag, Tags, Textarea, TextInput } from '@frontend/flib-react/lib/components';
import Button                              from '@frontend/flib-react/lib/components/button';
import styled                              from 'styled-components';
import { EventCreationActions }            from '../../core/event_creation/EventCreationCore';
import { useEventCreation }                from '../../hooks/useEventCreation';
import { EventsCreateTextMetadata }        from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { textMetadataValidationSchema } from './validationSchema';

const initialValues: EventsCreateTextMetadata = {
    name: '',
    description: '',
    tags: [],
};

const GeneralInfoForm: React.FC = () => {
    const [ inputTag, setInputTag ] = useState('');
    const eventCreationFormik = useEventCreation<EventsCreateTextMetadata>(
        EventCreationActions.TextMetadata,
        {
            initialValues,
            validationSchema: textMetadataValidationSchema,
            onSubmit: () => console.log('test'),
        }
    );

    // console.log(eventCreationFormik.values);

    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLElement>, tag: string) => {
        if(!inputTag || eventCreationFormik.values.tags?.length === 5) return;
        switch (e.key) {
            case 'Enter':
            case 'Tab':
                if (eventCreationFormik.values.tags.indexOf(tag) > -1) {
                    eventCreationFormik.setFieldTouched('tags', true);
                    eventCreationFormik.setFieldError('tags', 'tag already added');
                } else {
                    setInputTag('');
                    eventCreationFormik.setFieldValue('tags', [
                      ...eventCreationFormik.values.tags,
                      tag,
                    ]);
                }
                e.preventDefault();
        }
    };

    return (
        <Form onSubmit={eventCreationFormik.handleSubmit}>
            <TextInput
            name='name'
            label='Name'
            placeholder='Name of your event'
            {...eventCreationFormik.getFieldProps('name')}
            error={eventCreationFormik.computeError('name')}
            />
            <Textarea
            name='description'
            label='Description'
            placeholder='Describe your event'
            maxChar={1000}
            {...eventCreationFormik.getFieldProps('description')}
            error={eventCreationFormik.computeError('description')}
            />
            <Tags
            name='tags'
            label='Tags'
            placeholder='tags'
            currentTagsNumber={eventCreationFormik.values?.tags ? eventCreationFormik.values?.tags.length : 0}
            maxTags={5}
            inputValue={inputTag}
            onInputChange={(val: string) => setInputTag(val)}
            onKeyDown={onTagsKeyDown}
            value={eventCreationFormik.values.tags}
            onChange={(tags: string[]) => eventCreationFormik.setFieldValue('tags', tags)}
            onFocus={eventCreationFormik.handleFocus}
            onBlur={(e: any) => eventCreationFormik.handleBlur(e, 'tags', eventCreationFormik.values.tags)}
            error={eventCreationFormik.computeError('tags')}
            />
            <Button variant='primary' type='submit' title='Validate TextMetadata'/>
        </Form>
    );
};

const Form = styled.form`
    > * {
        margin-bottom: 35px
    }
`;

export default GeneralInfoForm;
