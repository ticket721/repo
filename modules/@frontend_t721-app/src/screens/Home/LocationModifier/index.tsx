import React, { useState }                            from 'react';
import { CurrentLocation, LocationList, SearchInput } from '@frontend/flib-react/lib/components';
import { Formik, FormikProps }                        from 'formik';
import { citiesList, City }                           from '@common/global';
import { QuickScore }                                 from 'quick-score';
import { useDispatch }                                from 'react-redux';
import { GetLocation }                                from '@frontend/core/lib/redux/ducks/location';
import { useTranslation }                             from 'react-i18next';

interface FormData {
    cityLabel: string;
}

export interface LocationModifierProps {
    disableFilter: () => void;
    setCustomCity: (city: City) => void;
}

const parsedCities = citiesList.cities.map((city: string[]): City => ({
    name: city[4],
    nameAscii: city[0],
    nameAdmin: city[5],
    country: city[1],
    coord: {
        lat: parseFloat(city[2]),
        lon: parseFloat(city[3]),
    },
    population: parseInt(city[6], 10),
    id: parseInt(city[7], 10),
}));

const qs = new QuickScore(parsedCities, {
    keys: ['nameAscii','nameAdmin', 'country'],
});

export const LocationModifier: React.FC<LocationModifierProps> = (coreProps: LocationModifierProps): JSX.Element => {

    const [t] = useTranslation('home');
    const dispatch = useDispatch();

    return <Formik
        initialValues={{
            cityLabel: '',
        }}
        onSubmit={null}
    >
        {
            (props: FormikProps<FormData>) => {

                let results: {label: string; value: City}[] = [];

                if (props.values.cityLabel !== '') {
                    results =
                        qs.search(props.values.cityLabel)
                            .slice(0, 20)
                            .map((res): {label: string; value: City} => ({
                                label: `${res.item.nameAscii}, ${res.item.nameAdmin}, ${res.item.country}`,
                                value: res.item
                            }))
                }

                const clearInput = () => {
                    props.setFieldValue('cityLabel', '');
                };

                const cancel = () => {
                    clearInput();
                    coreProps.disableFilter();
                };

                const requestCurrentLocation = () => {
                    coreProps.setCustomCity(null);
                    dispatch(GetLocation());
                    clearInput();
                };

                return <>
                    <SearchInput
                        onChange={props.handleChange}
                        cancel={cancel}
                        clearInput={null}
                        value={props.values.cityLabel}
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
                        results.length

                            ?
                            <LocationList
                                title={null}
                                locations={results}
                                selectedLocation={null}
                                updateLocation={coreProps.setCustomCity}
                            />

                            :
                            null

                    }
                </>;

            }
        }
    </Formik>;
};
