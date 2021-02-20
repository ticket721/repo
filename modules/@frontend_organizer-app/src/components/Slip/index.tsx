import React, { useContext, useEffect, useMemo, useState } from 'react';
import { EventsContext }                                   from '../Fetchers/EventsFetcher';
import styled                         from 'styled-components';
import { Button, TextInput }          from '@frontend/flib-react/lib/components';
import { useLazyRequest }             from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 }                         from 'uuid';
import { useToken }                   from '@frontend/core/lib/hooks/useToken';
import { PushNotification }           from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                from 'react-redux';
import { useTranslation }          from 'react-i18next';
import './locales';
import { EventsDocumentsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsDocumentsResponse.dto';
import { useFormik }                  from 'formik';
import * as Yup from 'yup';

const SlipCard = styled.div`
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    padding: ${props => props.theme.doubleSpacing};
    background-color: ${props => props.theme.darkBg};
    border-radius: ${props => props.theme.defaultRadius};
`

const download = (filename: string, text: string): void => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/octet-stream;base64,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const generateExport = (b64zip: string): void => {
    download('event-documents.zip', b64zip);
}

const PaddedTextInput = styled(TextInput)`
    margin: ${props => props.theme.doubleSpacing};
`


export const Slip = () => {
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@categories-fetch');
    const events = useContext(EventsContext);
    const dispatch = useDispatch();
    const [t] = useTranslation('slip');

    const documentSchema = useMemo(() => Yup.object().shape({
        fullname: Yup.string().required(t('required')),
        'street-address': Yup.string().required(t('required')),
        city: Yup.string().required(t('required')),
        country: Yup.string().required(t('required')),
        'postal-code': Yup.string().required(t('required')),
        'license-id': Yup.string(),
        'vat-id': Yup.string().required(t('required')),
        'vat': Yup.number().required(t('required')),
    }), [t]);

    const fetchSlipLazyRequest = useLazyRequest<EventsDocumentsResponseDto>('events.documents', uuid);

    const formik = useFormik({
        initialValues: {
            fullname: '',
            'street-address': '',
            'city': '',
            'country': '',
            'postal-code': '',
            'license-id': '',
            'vat-id': '',
            'vat': ''
        },
        validationSchema: documentSchema,
        onSubmit: values => {
            fetchSlipLazyRequest.lazyRequest([
                token,
                events.events[0].id,
                {
                    organizerName: values.fullname,
                    organizerStreet: values['street-address'],
                    organizerCity: values.city,
                    organizerPostalCode: values['postal-code'],
                    organizerCountry: values.country,
                    organizerLicenseId: values['license-id'] || 'NO ID',
                    organizerTvaId: values['vat-id'],
                    organizerTva: parseFloat(values.vat)
                },
                v4()
            ])
        },
    });

    const submittable = formik.isValid && formik.values.fullname !== '' && formik.values['street-address'] !== '' && formik.values.city !== '' && formik.values['postal-code'] !== '' && formik.values['vat-id'] !== '' && formik.values.vat !== '';

    useEffect(() => {

            if (!fetchSlipLazyRequest.response.loading) {
                if (fetchSlipLazyRequest.response.data) {
                    dispatch(PushNotification(t('export_slip_success'), 'success'));
                    generateExport(fetchSlipLazyRequest.response.data.b64ZipDocument);
                } else if (fetchSlipLazyRequest.response.error) {
                    dispatch(PushNotification(t('export_slip_failure'), 'error'));
                }
            }

        },
        // eslint-disable-next-line
        [fetchSlipLazyRequest.response.loading])

    return <SlipCard>
        <h1>{t('export_slip_title')}</h1>
        <p>{t('export_slip_description')}</p>
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flexWrap: 'wrap'
            }}
        >
            <div
                style={{
                    padding: 12,
                    width: '30%',
                    minWidth: '400px'
                }}
            >
                <h2
                    style={{
                        margin: 16
                    }}
                >{t('organizer-details')}</h2>
                <PaddedTextInput label={t('fullname')} name={'fullname'} placeholder={'ex: Vitalik Buterin'} onChange={formik.handleChange} value={formik.values.fullname} error={formik.errors.fullname}/>
                <PaddedTextInput label={t('street-address')} name={'street-address'} placeholder={'ex: 14-16 rue Soleillet'} onChange={formik.handleChange} value={formik.values['street-address']} error={formik.errors['street-address']}/>
                <PaddedTextInput label={t('city')} name={'city'} placeholder={'ex: Paris'} onChange={formik.handleChange} value={formik.values.city} error={formik.errors.city}/>
                <PaddedTextInput label={t('postal-code')} name={'postal-code'} placeholder={'ex: 75020'} onChange={formik.handleChange} value={formik.values['postal-code']} error={formik.errors['postal-code']}/>
                <PaddedTextInput label={t('country')} name={'country'} placeholder={'ex: France'} onChange={formik.handleChange} value={formik.values.country} error={formik.errors.country}/>
                <PaddedTextInput label={t('license-id')} name={'license-id'} placeholder={'ex: ALKSJDLKAJSDL'} onChange={formik.handleChange} value={formik.values['license-id']} error={formik.errors['license-id']}/>
            </div>
            <div
                style={{
                    padding: 12,
                    width: '30%',
                    minWidth: '400px'
                }}
            >
                <h2
                    style={{
                        margin: 16
                    }}
                >{t('vat')}</h2>
                <PaddedTextInput label={t('vat-id')} name={'vat-id'} placeholder={'ex: FR95878930166'} onChange={formik.handleChange} value={formik.values['vat-id']} error={formik.errors['vat-id']}/>
                <PaddedTextInput label={t('vat')} name={'vat'} placeholder={'ex: 2.5'} options={{numeral: true}} onChange={formik.handleChange} value={formik.values.vat} error={formik.errors.vat}/>
            </div>
        </div>
        <Button
            style={{
                width: '30%'
            }}
            title={t('export_slip_button')}
            loadingState={fetchSlipLazyRequest.response.loading}
            variant={fetchSlipLazyRequest.response.loading || !submittable ? 'disabled' : 'primary'}
            onClick={formik.handleSubmit}
        />
    </SlipCard>;
}
