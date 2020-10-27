import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { v4 }                     from 'uuid';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Formik } from 'formik';

import { checkDate, DateCreationPayload } from '@common/global';

import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { AppState } from '@frontend/core/lib/redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';

import { FullPageLoading, Error, Button, LeafletMap } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm } from '../../components/GeneralInfoForm';
import { StylesForm } from '../../components/StylesForm';
import { dateParam } from '../types';
import { formatDateEntity, formatDateTypology, nullifyUnsetSocials } from './formatter';
import './locales';
import { DatesAndTypologyForm } from '../../components/DatesAndTypologyForm';

const subFormsTitle = {
    dates_typology: 'date_and_typology_title',
    styles: 'styles_title',
    textMetadata: 'general_infos_title',
};

const defaultValues: DateCreationPayload = {
    info: {
        online: false,
        name: '',
        eventBegin: null,
        eventEnd: null,
        location: {
            label: '',
            lon: null,
            lat: null,
        },
    },
    textMetadata: {
        name: '',
        description: '',
    },
    imagesMetadata: {
        avatar: '',
        signatureColors: ['', ''],
    },
};

export const UpdateDate: React.FC = () => {
    const { t } = useTranslation(['update_date', 'common']);

    const dispatch = useDispatch();

    const { search } = useLocation();
    const subform = new URLSearchParams(search).get('subform');

    const { dateId } = useParams<dateParam>();

    const [uuid] = React.useState(v4() + '@update-general-infos');
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const [ dateInitialValues, setDateInitialValues ] = useState<DateCreationPayload>(defaultValues);
    const { response: dateResp, force: forceDateReq } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $eq: dateId,
                    }
                },
            ],
            refreshRate: 0,
        },
        uuid
    );

    useEffect(() => {
        forceDateReq();
    // eslint-disable-next-line
    }, [subform]);

    useDeepEffect(() => {
        if (dateResp.data?.dates[0]) {
            const date: DateEntity = dateResp.data.dates[0];
            setDateInitialValues(formatDateEntity(date));
        }
    }, [dateResp.data?.dates[0]]);

    const buildForm = (): JSX.Element => {
        switch (subform) {
            case 'dates_typology':
                return <DatesAndTypologyForm
                    parentField={'info'}/>;
            case 'styles': return <StylesForm/>;
            default: return <GeneralInfoForm/>;
        }
    };

    const submit = (date: DateCreationPayload) => {
        global.window.t721Sdk.dates.edit(
            token,
            dateId,
            {
                date: {
                    ...date,
                    textMetadata: nullifyUnsetSocials(date.textMetadata),
                    info: formatDateTypology(date.info),
                }
            }
        ).then(() => {
            dispatch(PushNotification(t('update_successful', { entity: 'date' }), 'success'));
            forceDateReq();
        }).catch((e) => dispatch(PushNotification(e.message, 'error')));
    };

    if (dateResp.loading) {
        return <FullPageLoading/>;
    }

    if (dateResp.error) {
        return <Error message={t('common:error_cannot_fetch', { entity: 'date'})} retryLabel={t('common:retrying_in')} onRefresh={forceDateReq}/>;
    }

    return <Formik
    enableReinitialize={true}
    initialValues={dateInitialValues}
    onSubmit={submit}
    validate={checkDate}>
        {
            formikProps =>
                <Form onSubmit={formikProps.handleSubmit}>
                    <Title>{t(subFormsTitle[subform] || subFormsTitle.textMetadata)}</Title>
                    {
                        buildForm()
                    }
                    {
                        subform === 'dates_typology' && formikProps.values.info.location ?
                        <div className={'location-map'}>
                            <LeafletMap
                            width={'600px'}
                            height={'300px'}
                            coords={formikProps.values.info.location}/>
                        </div> :
                        null
                    }
                    <SubmitButton
                        type={'submit'}
                        variant={(
                            formikProps.isValid
                            && JSON.stringify(formikProps.values) !== JSON.stringify(formikProps.initialValues)
                        ) ? 'custom' : 'disabled'}
                        gradients={formikProps.values.imagesMetadata.signatureColors}
                        title={t('update_date_btn')}
                    />
                </Form>
        }
    </Formik>;
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
