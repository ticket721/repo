import React, { useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FormikProvider, useFormik } from 'formik';

import { checkDate, DateCreationPayload } from '@common/global';

import { DatesEditResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesEditResponse.dto';

import { useUploadImage } from '@frontend/core/lib/hooks/useUploadImage';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';

import { Button, LeafletMap } from '@frontend/flib-react/lib/components';

import { GeneralInfoForm }                                           from '../../../components/GeneralInfoForm';
import { StylesForm }                                                from '../../../components/StylesForm';
import { formatDateEntity, formatDateTypology, nullifyUnsetSocials } from './formatter';
import './locales';
import { DatesAndTypologyForm }                                      from '../../../components/DatesAndTypologyForm';
import { useLazyRequest }                                            from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 } from 'uuid';
import { uploadImageWithSdk } from '../../../utils/uploadImageWithSdk';
import { DatesContext } from '../../../components/Fetchers/DatesFetcher';

const subFormsTitle = {
    'dates-typology': 'date_and_typology_title',
    'styles': 'styles_title',
    'general-infos': 'general_infos_title',
};

export const EditDateView: React.FC = () => {
    const { t } = useTranslation(['edit_date', 'common']);

    const history = useHistory();
    const dispatch = useDispatch();

    const { pathname } = useLocation();
    const subform = pathname.substring(pathname.lastIndexOf('/') + 1);

    const [editUuid] = React.useState('@edit-date' + v4());
    const token = useToken();

    const { url: uploadImgUrl, error: uploadImgError, uploadImage } = useUploadImage(token);

    const { dates, forceFetch: fetchDates } = useContext(DatesContext);

    const { response: editResp, lazyRequest: editDate } = useLazyRequest<DatesEditResponseDto>('dates.edit', editUuid);

    const buildForm = (): JSX.Element => {
        switch (subform) {
            case 'general-infos':
                return <GeneralInfoForm
                primaryColor={formik.values.imagesMetadata.signatureColors[0]}
                uploadDescImage={async (file) => {
                    const url = await uploadImageWithSdk(token, file);

                    if (!url) {
                        dispatch(PushNotification(t('upload_error'), 'error'));
                        return;
                    }

                    return url;
                }}/>;
            case 'dates-typology':
                return <DatesAndTypologyForm
                    parentField={'info'}/>;
            case 'styles': return <StylesForm
            eventName={formik.values.textMetadata.name}
            parentField={'imagesMetadata'}
            uploadImage={(file) => uploadImage(file, v4())}/>;
            default: return <DatesAndTypologyForm parentField={'info'}/>;
        }
    };

    const onSubmit = (date: DateCreationPayload) => {
        editDate([
            token,
            dates[0].id,
            {
                date: {
                    ...date,
                    textMetadata: nullifyUnsetSocials(date.textMetadata),
                    info: formatDateTypology(date.info),
                }
            },
            v4(),
        ], { force: true });
    };

    const formik = useFormik({
        initialValues: formatDateEntity(dates[0]),
        onSubmit,
        validate: checkDate,
    });

    useEffect(() => {
        if (uploadImgUrl) {
            formik.setFieldValue('imagesMetadata.avatar', uploadImgUrl);
        }
        // eslint-disable-next-line
    }, [uploadImgUrl]);

    useEffect(() => {
        if (uploadImgError) {
            dispatch(PushNotification(t('upload_error'), 'error'));
        }
        // eslint-disable-next-line
    }, [uploadImgError]);

    /* on date edit */
    useEffect(() => {
        if (editResp.data?.date) {
            dispatch(PushNotification(t('edit_successful'), 'success'));
            fetchDates();
            history.push(`/event/${dates[0].event}`);
        }
    // eslint-disable-next-line
    }, [editResp.data?.date]);

    useEffect(() => {
        if (editResp.error) {
            dispatch(PushNotification(t('edit_error'), 'error'));
        }
    // eslint-disable-next-line
    }, [editResp.error]);

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
