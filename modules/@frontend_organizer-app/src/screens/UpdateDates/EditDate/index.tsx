import React, { useEffect, useState } from 'react';
import { Redirect, useLocation, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FormikProvider, useFormik } from 'formik';

import { checkDate, DateCreationPayload } from '@common/global';

import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DatesEditResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesEditResponse.dto';
import { DateEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { AppState } from '@frontend/core/lib/redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';

import { FullPageLoading, Error, Button, LeafletMap } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm }                                           from '../../../components/GeneralInfoForm';
import { StylesForm }                                                from '../../../components/StylesForm';
import { dateParam }                                                 from '../../types';
import { formatDateEntity, formatDateTypology, nullifyUnsetSocials } from './formatter';
import './locales';
import { DatesAndTypologyForm }                                      from '../../../components/DatesAndTypologyForm';
import { useLazyRequest }                                            from '@frontend/core/lib/hooks/useLazyRequest';
import { isRequestError }                                            from '@frontend/core/lib/utils/isRequestError';
import { getEnv }                                                    from '@frontend/core/lib/utils/getEnv';

const subFormsTitle = {
    'dates-typology': 'date_and_typology_title',
    'styles': 'styles_title',
    'general-infos': 'general_infos_title',
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

export const EditDate: React.FC = () => {
    const { t } = useTranslation(['edit_date', 'common']);

    const dispatch = useDispatch();

    const { pathname } = useLocation();
    const subform = pathname.substring(pathname.lastIndexOf('/') + 1);

    const { dateId } = useParams<dateParam>();

    const [fetchUuid] = React.useState('@fetch-date' + dateId);
    const [editUuid] = React.useState('@edit-date' + dateId);
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const [ initialValues, setInitialValues ] = useState<DateCreationPayload>(defaultValues);
    const dateResp = useRequest<DatesSearchResponseDto>(
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
        fetchUuid
    );

    const { response: editResp, lazyRequest: editDate } = useLazyRequest<DatesEditResponseDto>('dates.edit', editUuid);

    const buildForm = (): JSX.Element => {
        switch (subform) {
            case 'general-infos':
                return <GeneralInfoForm/>;
            case 'dates-typology':
                return <DatesAndTypologyForm
                    parentField={'info'}/>;
            case 'styles': return <StylesForm/>;
            default: return <Redirect to={'/'}/>;
        }
    };

    const onSubmit = (date: DateCreationPayload) => editDate([
        token,
        dateId,
        {
            date: {
                ...date,
                textMetadata: nullifyUnsetSocials(date.textMetadata),
                info: formatDateTypology(date.info),
            }
        }
    ], { force: true });

    const formik = useFormik({
        initialValues,
        onSubmit,
        validate: checkDate,
        enableReinitialize: true,
    });

    /* on date fetch */
    useEffect(() => {
        dateResp.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
    // eslint-disable-next-line
    }, [subform]);

    useDeepEffect(() => {
        if (dateResp.response.data?.dates[0]) {
            const date: DateEntity = dateResp.response.data.dates[0];
            setInitialValues(formatDateEntity(date));
        }
    // eslint-disable-next-line
    }, [dateResp.response.data?.dates[0]]);

    /* on date edit */
    useEffect(() => {
        if (editResp.data?.date) {
            dispatch(PushNotification(t('edit_successful'), 'success'));
        }
    // eslint-disable-next-line
    }, [editResp.data?.date]);

    useEffect(() => {
        if (editResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [editResp.error]);

    if (dateResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(dateResp)) {
        return <Error message={t('common:error_cannot_fetch', { entity: 'date'})} retryLabel={t('common:retrying_in')} onRefresh={dateResp.force}/>;
    }

    return <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
            <Title>{t(subFormsTitle[subform])}</Title>
            {
                buildForm()
            }
            {
                subform === 'dates-typology' && formik.values.info.location ?
                <div className={'location-map'}>
                    <LeafletMap
                    width={'600px'}
                    height={'300px'}
                    coords={formik.values.info.location}/>
                </div> :
                null
            }
            <SubmitButton
                type={'submit'}
                variant={(
                    formik.isValid
                    && JSON.stringify(formik.values) !== JSON.stringify(formik.initialValues)
                ) ? 'custom' : 'disabled'}
                gradients={formik.values.imagesMetadata.signatureColors}
                title={t('edit_date_btn')}
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
