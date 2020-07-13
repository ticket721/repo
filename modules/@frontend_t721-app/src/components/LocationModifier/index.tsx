import React, { useEffect, useState }                                         from 'react';
import { CurrentLocation, LocationList, SearchInput, FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useFormik }          from 'formik';
import { City, MatchingCity } from '@common/global';
import { useDispatch }        from 'react-redux';
import { useTranslation }                                                     from 'react-i18next';
import { GetLocation, SetCustomLocation }                                     from '../../redux/ducks/location';
import { v4 }                                                                 from 'uuid';
import { useRequest }                                                         from '@frontend/core/lib/hooks/useRequest';
import { GeolocFuzzySearchResponseDto }                                       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/geoloc/dto/GeolocFuzzySearchResponse.dto';
import './locales';

export interface LocationModifierListProps {
    query: string;
    updateLocation: (city: City) => void;
}

const LocationModifierList: React.FC<LocationModifierListProps> = (props: LocationModifierListProps): JSX.Element => {

    const [uuid] = useState(v4());
    const [t] = useTranslation(['location_modifier', 'common']);

    const locationRequest = useRequest<GeolocFuzzySearchResponseDto>({
        method: 'geoloc.fuzzySearch',
        args: [
            null,
            {
                query: props.query,
                limit: 10,
            },
        ],
        refreshRate: 1000,
    }, `LocationModifier@${uuid}`);

    if (locationRequest.response.loading) {
        return <FullPageLoading/>;
    }

    if (locationRequest.response.error) {
        return <Error message={t('error_location_request_fail')} retryLabel={t('common:retrying_in')} onRefresh={locationRequest.force}/>;
    }

    const results: { label: string; value: City; idx: number; }[] = locationRequest.response.data.cities.map((mc: MatchingCity, idx: number) => ({
        label: `${mc.city.name}, ${mc.city.nameAdmin}, ${mc.city.country}`,
        value: mc.city,
        idx,
    }));

    return <LocationList
        title={null}
        locations={results}
        selectedLocation={null}
        updateLocation={props.updateLocation}
    />;
};

export interface LocationModifierProps {
    disableFilter: () => void;
}

export const LocationModifier: React.FC<LocationModifierProps> = (coreProps: LocationModifierProps): JSX.Element => {

    const [t] = useTranslation('location_modifier');
    const [queryValue, setQueryValue] = useState('');
    const dispatch = useDispatch();
    const fmk = useFormik({
        initialValues: {
            cityLabel: '',
        },
        onSubmit: null,
    });

    useEffect(() => {
        let timeoutId = null;

        if (queryValue !== fmk.values.cityLabel) {
            timeoutId = setTimeout(() => {
                setQueryValue(fmk.values.cityLabel);
            }, 1000);
        }

        return () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
        };
    }, [queryValue, fmk.values.cityLabel]);

    const clearInput = () => {
        fmk.setFieldValue('cityLabel', '');
    };

    const cancel = () => {
        clearInput();
        coreProps.disableFilter();
    };

    const requestCurrentLocation = () => {
        dispatch(GetLocation());
        clearInput();
        coreProps.disableFilter();
    };

    return <>
        <SearchInput
            onChange={fmk.handleChange}
            cancel={cancel}
            clearInput={null}
            value={fmk.values.cityLabel}
            name={'cityLabel'}
            autofocus={true}
            icon={'pin'}

            placeholder={t('search_city')}
            cancelLabel={t('cancel')}
        />
        <CurrentLocation
            label={t('use_current_location')}
            getCurrentLocation={requestCurrentLocation}
        />
        {
            queryValue !== ''

                ?
                <LocationModifierList

                    query={queryValue}
                    updateLocation={(city: City): void => {
                        dispatch(SetCustomLocation({
                            lat: city.coord.lat,
                            lon: city.coord.lon,
                            city,
                        }));
                        coreProps.disableFilter();
                    }}

                />

                :
                null

        }
    </>;

};
