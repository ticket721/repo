import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FormikProvider, useFormik } from 'formik';

import { EventsEditResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsEditResponse.dto';

import { useToken } from '@frontend/core/lib/hooks/useToken';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';

import { Button } from '@frontend/flib-react/lib/components';

import { formatEventEntity } from './formatter';
import './locales';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { checkEventGenericInfos, EventGenericInfosPayload } from '@common/global/lib/event';
import { EditEventFields } from './EditEventFields';
import { v4 } from 'uuid';
import { EventsContext } from '../../components/Fetchers/EventsFetcher';

export const EditEventView: React.FC = () => {
    const { t } = useTranslation(['edit_event', 'common']);

    const dispatch = useDispatch();

    const [editUuid] = React.useState('@edit-event' + v4());
    const token = useToken();

    const { events, forceFetch: fetchEvents } = useContext(EventsContext);

    const { response: editResp, lazyRequest: editEvent } = useLazyRequest<EventsEditResponseDto>('events.edit', editUuid);

    const onSubmit = (event: EventGenericInfosPayload) => {
            editEvent([
            token,
            events[0].id,
            {
                name: event.name,
                description: event.description,
                avatar: event.avatar,
                signature_colors: event.signatureColors,
            },
            v4(),
        ], { force: true });
    };

    const formik = useFormik({
        initialValues: formatEventEntity(events[0]),
        onSubmit,
        validate: checkEventGenericInfos,
    });

    /* on date edit */
    useEffect(() => {
        if (editResp.data?.event) {
            dispatch(PushNotification(t('edit_successful'), 'success'));
            fetchEvents();
        }
    // eslint-disable-next-line
    }, [editResp.data?.event]);

    useEffect(() => {
        if (editResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [editResp.error]);

    return <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
            <Title>{t('event_title')}</Title>
            <EditEventFields/>
            <SubmitButton
                type={'submit'}
                variant={(
                    formik.isValid
                    && JSON.stringify(formik.values) !== JSON.stringify(formik.initialValues)
                ) ? 'custom' : 'disabled'}
                gradients={formik.values.signatureColors}
                title={t('edit_event_btn')}
            />
        </Form>
    </FormikProvider>;
}

const Form = styled.form`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;

    .location-map {
        z-index: 0;
        margin-top: ${props => props.theme.biggerSpacing};
        border-radius: ${props => props.theme.defaultRadius};
        overflow: hidden;
    }
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.doubleSpacing};
    text-align: left;
    width: 100%;
`;

const SubmitButton = styled(Button)`
    margin-top: ${props => props.theme.doubleSpacing};
`;
