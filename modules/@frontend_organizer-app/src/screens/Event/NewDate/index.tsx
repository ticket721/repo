import React from 'react';
import { useFormik } from 'formik';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { useParams, useHistory } from 'react-router';

import {Button } from '@frontend/flib-react/lib/components';
import { AppState } from '@frontend/core/src/redux/ducks';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import {
    DatesCreateResponseDto
} from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesCreateResponse.dto';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';

import '../../../shared/Translations/generalInfoForm';
import '../../../shared/Translations/global';
import DateForm from '../../../components/DateForm';

import { completeDateValidation }  from './validationSchema';
import { Metadata }                from './Metadata';
import { Styles }                  from './Styles';

const NewDate = (): JSX.Element => {
    const [ t ] = useTranslation(['general_infos', 'notify', 'global', 'event_creation_styles']);
    const history = useHistory();
    const { groupId, eventId } = useParams();
    const dispatch = useDispatch();
    const [uuidEvent] = React.useState(v4() + '@new-date_events.search');
    const [uuid] = React.useState(v4() + '@new-date');
    const token = useSelector((state: AppState): string => state.auth.token.value);
    const { response: eventsResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    id: {
                        $eq: eventId
                    }
                }
            ],
          refreshRate: 1,
        },
        uuidEvent
    );
    const { lazyRequest: createDate, response: createResponse } = useLazyRequest<DatesCreateResponseDto>('dates.create', uuid);
    const { lazyRequest: addDate, response: addResponse } = useLazyRequest<DatesCreateResponseDto>('events.addDates', uuid);

    const formik = useFormik({
        initialValues: {
            eventBegin: new Date(),
            eventEnd: new Date(),
            location: { lon: null, lat: null, label: ''},
            name: '',
            description: '',
            tags: [],
            avatar: '',
            signature_colors: []
        },
        onSubmit: (values) => {
            createDate([token, {
                group_id: groupId,
                metadata: {
                    name: values.name,
                    description: values.description,
                    tags: values.tags,
                    avatar: values.avatar,
                    signature_colors: values.signature_colors,
                },
                timestamps: {
                    event_begin: values.eventBegin,
                    event_end: values.eventEnd,
                },
                location: {
                    location_label: values.location.label,
                    location: {
                        lon: values.location.lon,
                        lat: values.location.lat,
                    }
                }}], {
                force: true
            });
        },
        validationSchema: completeDateValidation,
    });

    useDeepEffect(() => {
        if (createResponse.error) {
            dispatch(PushNotification(t(createResponse.error), 'error'));
        }
    }, [createResponse.error]);

    useDeepEffect(() => {
        if (createResponse.data) {
            addDate([token, eventId, { dates: [createResponse.data.date.id]}])
        }
    }, [createResponse.data]);

    useDeepEffect(() => {
        if (addResponse.error) {
            dispatch(PushNotification(t(createResponse.error), 'error'));
        }
    }, [addResponse.error]);

    useDeepEffect(() => {
        if (addResponse.data) {
            dispatch(PushNotification(t('success'), 'success'));
            history.push(`/group/${groupId}/date/${createResponse.data.date.id}`);
        }
    }, [addResponse.data]);

    useDeepEffect(() => {
        if (!eventsResp.loading && eventsResp.data && eventsResp.data.events.length === 0) {
            history.push('/');
        }
    }, [eventsResp.data]);

    const renderFormActions = () => (<Button variant='primary' type='submit' title={t('global:validate')}/>);

    return (
        <Form onSubmit={formik.handleSubmit}>
            <div className={'form-container'}>
                <Metadata formik={formik}/>
                <Styles formik={formik}/>
                <DateForm
                    formik={formik}
                    formActions={renderFormActions}
                />
              </div>
          </Form>
    )
};

const Form = styled.form`
    width: 100%;
    display: flex;
    justify-content: center;

    .form-container {
      @media (min-width: 1024px) {
        max-width: 600px;
      }
      width: 100%;
      min-width: 375px;
      > * {
        margin-bottom: 35px
      }
    }
`;

export default NewDate;
