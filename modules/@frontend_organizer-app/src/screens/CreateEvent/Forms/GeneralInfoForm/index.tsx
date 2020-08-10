import React, { useState } from 'react';
import { Tags, RichText, TextInput }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';
import { EventCreationActions, EventCreationSteps } from '../../../../core/event_creation/EventCreationCore';
import { useEventCreation }                         from '../../../../hooks/useEventCreation';
import { EventsCreateTextMetadata }        from '@common/sdk/lib/@backend_nest/apps/worker/src/actionhandlers/events/Events.input.handlers';
import { textMetadataValidationSchema } from './validationSchema';

import { useTranslation } from 'react-i18next';
import './locales';
import { FormProps }      from '../../';
import { useDeepEffect }  from '@frontend/core/lib/hooks/useDeepEffect';

const defaultValues: EventsCreateTextMetadata = {
    name: '',
    description: '',
    tags: [],
};

const GeneralInfoForm: React.FC<FormProps> = ({ onComplete }) => {
    const [ inputTag, setInputTag ] = useState('');
    const [ t ] = useTranslation(['general_infos', 'validation']);

    const eventCreationFormik = useEventCreation<EventsCreateTextMetadata>(
        EventCreationSteps.GeneralInfo,
        EventCreationActions.TextMetadata,
        textMetadataValidationSchema,
        defaultValues,
    );

    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLElement>, tag: string) => {
        if(!tag && eventCreationFormik.values.tags?.length === 5) {
            e.preventDefault();
            return;
        }

        switch (e.key) {
            case 'Enter':
            case 'Tab':
                if (!eventCreationFormik.touched.tags) {
                    eventCreationFormik.setFieldTouched('tags');
                }
                if (tag.length > 0) {
                    if (eventCreationFormik.values.tags.indexOf(tag) > -1) {
                        eventCreationFormik.setFieldError('tags', 'tag_already_added');
                    } else if (tag.length < 3) {
                        eventCreationFormik.setFieldError('tags', 'tag_too_short');
                    } else if (tag.length > 16) {
                        eventCreationFormik.setFieldError('tags', 'tag_too_long');
                    } else {
                        setInputTag('');
                        eventCreationFormik.update({
                            ...eventCreationFormik.values,
                            tags: [
                                ...eventCreationFormik.values.tags,
                                tag,
                            ]
                        });
                    }
                    e.preventDefault();
                } else {
                    if (eventCreationFormik.values.tags.length === 0) {
                        eventCreationFormik.setFieldError('tags', 'tag_required');
                    }
                }
        }
    };

    useDeepEffect(() => {
        if (eventCreationFormik.isValid && eventCreationFormik.values !== eventCreationFormik.initialValues) {
            onComplete(true);
        } else {
            onComplete(false);
        }
    }, [
        eventCreationFormik.isValid,
        eventCreationFormik.initialValues,
        eventCreationFormik.values,
    ]);

    console.log('FORM Value : ', eventCreationFormik.getFieldProps('description').value);
    return (
        <Form onSubmit={eventCreationFormik.handleSubmit}>
            <TextInput
            name='name'
            label={t('name_label')}
            placeholder={t('name_placeholder')}
            {...eventCreationFormik.getFieldProps('name', true)}
            error={
                eventCreationFormik.computeError('name')
                && t(eventCreationFormik.computeError('name'))
            }
            />
            <RichText
            name='description'
            label={t('description_label')}
            placeholder={t('description_placeholder')}
            maxChar={900}
            value={eventCreationFormik.getFieldProps('description').value}
            onChange={(value) => eventCreationFormik.setFieldValue('description', value)}
            onBlur={eventCreationFormik.getFieldProps('description').onBlur}
            onFocus={eventCreationFormik.getFieldProps('description').onFocus}
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
            onChange={(tags: string[]) => {
                if (tags.length === 0) {
                    eventCreationFormik.setFieldError('tags', 'tag_required');
                }

                eventCreationFormik.update({
                    ...eventCreationFormik.values,
                    tags
                });
            }}
            onFocus={eventCreationFormik.handleFocus}
            error={
                eventCreationFormik.computeError('tags')
                && t(eventCreationFormik.computeError('tags'))
            }
            />
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
