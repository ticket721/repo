import React, { useEffect, useState } from 'react';
import styled                         from 'styled-components';

import { useTranslation } from 'react-i18next';
import './locales';

import { useFormik }                   from 'formik';
import { useDispatch, useSelector }    from 'react-redux';
import { useLazyRequest }              from '@frontend/core/lib/hooks/useLazyRequest';
import { AppState } from '@frontend/core/lib/redux';
// import { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
// import { LocationInput }               from '@frontend/core/lib/components/LocationInput';
import { Button, LeafletMap }          from '@frontend/flib-react/lib/components';
import { locationValidationSchema }    from './validationSchema';
import { InputDateLocation }           from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { Coordinates }                 from '@common/global';
import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { isEqual }                     from 'lodash';
// import { getEnv }                      from '@frontend/core/lib/utils/getEnv';

interface LocationFormProps {
    uuid: string;
    dateId: string;
    initialValues: InputDateLocation,
}

interface Location {
    locationLabel: string;
    coords: Coordinates;
}

export const LocationForm: React.FC<LocationFormProps> = (props: LocationFormProps) => {
    const [ lastInitialValues, setLastInitialValues ] = useState<Location>(null);
    const [ updatable, setUpdatable ] = useState<boolean>(false);
    const dispatch = useDispatch();
    const [ t ] = useTranslation(['update_location', 'validation', 'errors']);

    const token = useSelector((state: AppState): string => state.auth.token.value);
    const { lazyRequest: updateLocation, response: updateResponse } = useLazyRequest('dates.update', props.uuid);

    const formik = useFormik<Location>({
        initialValues: {
            locationLabel: props.initialValues.location_label,
            coords: props.initialValues.location,
        },
        validationSchema: locationValidationSchema,
        onSubmit: (values) => {
            updateLocation([
                token,
                props.dateId,
                {
                    location: {
                        location_label: values.locationLabel,
                        location: values.coords,
                    }
                }
            ], {
                force: true
            });
        }
    });

    // const onLocationChange = (result: any) => {
    //     geocodeByAddress(result.description)
    //         .then((gecodeResult) => {
    //                 getLatLng(gecodeResult[0])
    //                     .then(({ lat, lng }) => {
    //                         formik.setValues({
    //                             locationLabel: gecodeResult[0].formatted_address,
    //                             coords: {
    //                                 lon: lng,
    //                                 lat
    //                             }
    //                         });
    //                     }).catch(() => {
    //                     dispatch(PushNotification(t('errors:google_api_error'), 'error'));
    //                     formik.setValues({
    //                         locationLabel: '',
    //                         coords: {
    //                             lon: null,
    //                             lat: null,
    //                         },
    //                     });
    //                 })
    //             }
    //         ).catch(() => {
    //         dispatch(PushNotification(t('errors:google_api_error'), 'error'));
    //         formik.setValues({
    //             locationLabel: '',
    //             coords: {
    //                 lon: null,
    //                 lat: null,
    //             },
    //         });
    //     });
    // };

    // const computeError = (field: string) => formik.touched[field] && formik.errors[field] ? 'validation:' + formik.errors[field] : '';

    useDeepEffect(() => {
        if (updateResponse.data) {
            dispatch(PushNotification('Successfuly updated', 'success'));
        }
    }, [updateResponse.data]);

    useDeepEffect(() => {
        setUpdatable(formik.isValid && !isEqual(formik.values, lastInitialValues));
    }, [formik.values, lastInitialValues, formik.isValid]);

    useEffect(() => {
        setLastInitialValues({
            locationLabel: props.initialValues.location_label,
            coords: props.initialValues.location,
        })
    }, [props.initialValues]);

    useEffect(() => {
        if(updateResponse.error) {
            dispatch(PushNotification('Update failed. Please retry.', 'error'));
        }
    }, [updateResponse.error, dispatch]);

    return (
        <Form onSubmit={formik.handleSubmit}>
            {/* <LocationInput
                googleApiKey={getEnv().REACT_APP_GOOGLE_PLACES_API_KEY}
                name={'location'}
                initialValue={formik.values.locationLabel}
                label={t('location_label')}
                placeholder={t('location_placeholder')}
                onSelect={onLocationChange}
                error={
                    computeError('location') &&
                    t(computeError('location'))
                }
            /> */}
            <LeafletMap
            width={'600px'}
            height={'300px'}
            coords={formik.values.coords}/>
            <Button
                variant={updatable ? 'primary' : 'disabled'}
                type='submit'
                title={t('save_changes')}/>
        </Form>
    );
};

const Form = styled.form`
    width: 100%;

    > * {
        margin-bottom: 35px
    }

    .leaflet-container {
        border-radius: ${props => props.theme.defaultRadius};
    }
`;
