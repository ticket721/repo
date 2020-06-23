import React, { useState } from 'react';
import { Button, Tags, Textarea, TextInput }   from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';
import { EventCreationActions, EventCreationSteps } from '../../core/event_creation/EventCreationCore';
import { useEventCreation }                         from '../../hooks/useEventCreation';
import { EventsCreateTextMetadata }        from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { textMetadataValidationSchema } from './validationSchema';

import { useTranslation } from 'react-i18next';
import '../../shared/Translations/generalInfoForm';

const initialValues: EventsCreateTextMetadata = {
    name: '',
    description: '',
    tags: [],
};

const GeneralInfoForm: React.FC = () => {
    const [ inputTag, setInputTag ] = useState('');
    const [ t ] = useTranslation(['general_infos', 'validation']);

    const eventCreationFormik = useEventCreation<EventsCreateTextMetadata>(
        EventCreationSteps.GeneralInfo,
        EventCreationActions.TextMetadata,
        {
            initialValues,
            validationSchema: textMetadataValidationSchema,
            onSubmit: () => console.log('test'),
        }
    );

    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLElement>, tag: string) => {
        if(!inputTag) {
            if (eventCreationFormik.values.tags?.length === 5) {
                e.preventDefault();
            }

            return;
        }

        switch (e.key) {
            case 'Enter':
            case 'Tab':
                if (!eventCreationFormik.touched.tags) {
                    eventCreationFormik.setFieldTouched('tags');
                }
                if (eventCreationFormik.values.tags.indexOf(tag) > -1) {
                    eventCreationFormik.setFieldError('tags', 'tag_already_added');
                } else if (inputTag.length < 3) {
                    eventCreationFormik.setFieldError('tags', 'tag_too_short');
                } else if (inputTag.length > 16) {
                    eventCreationFormik.setFieldError('tags', 'tag_too_long');
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
            label={t('name_label')}
            placeholder={t('name_placeholder')}
            {...eventCreationFormik.getFieldProps('name')}
            error={
                eventCreationFormik.computeError('name')
                && t(eventCreationFormik.computeError('name'))
            }
            />
            <Textarea
            name='description'
            label={t('description_label')}
            placeholder={t('description_placeholder')}
            maxChar={1000}
            {...eventCreationFormik.getFieldProps('description')}
            error={
                eventCreationFormik.computeError('description')
                && t(eventCreationFormik.computeError('description'))
            }
            />
            <Tags
            name='tags'
            label={t('tags_label')}
            placeholder={t('tags_placeholder')}
            currentTagsNumber={eventCreationFormik.values?.tags ? eventCreationFormik.values?.tags.length : 0}
            maxTags={5}
            inputValue={inputTag}
            onInputChange={(val: string) => setInputTag(val)}
            onKeyDown={onTagsKeyDown}
            value={eventCreationFormik.values.tags}
            onChange={(tags: string[]) => eventCreationFormik.setFieldValue('tags', tags)}
            onFocus={eventCreationFormik.handleFocus}
            onBlur={(e: any) => {
                eventCreationFormik.handleBlur(e, 'tags');
            }}
            error={
                eventCreationFormik.computeError('tags')
                && t(eventCreationFormik.computeError('tags'))
            }
            />
            <Button {...eventCreationFormik.getSubmitButtonProps('Continue')}/>
        </Form>
    );
};

const Form = styled.form`
    width: 100%;

    > * {
        margin-bottom: 35px
    }
`;

export default GeneralInfoForm;
