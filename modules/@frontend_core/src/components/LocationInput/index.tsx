import React, { ChangeEvent } from 'react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';
import { TextInput } from '@frontend/flib-react/lib/components';
import styled from 'styled-components';
import { DateLocationPayload } from '@common/global';

import './locales';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { PushNotification } from '../../redux/ducks/notifications';

export interface SuggestionsProps {
    activeSuggestion: number;
    suggestions: Array<any>;
    onSelectSuggestion: (selection: any, event: any) => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ activeSuggestion, suggestions, onSelectSuggestion }) => (
    <SuggestionContainer>
        {suggestions.map((suggestion, idx) => (
            <div
                key={suggestion.description + idx}
                className={idx === activeSuggestion ? 'active' : null}
                onClick={(event) => onSelectSuggestion(suggestion, event)}
            >
                {suggestion.description}
            </div>
        ))}
    </SuggestionContainer>
);

const LocationInputContainer = styled.div`
    & > div {
        position: relative;
    }
`;

const SuggestionContainer = styled.div`
    position: absolute;
    z-index: 3;
    width: fit-content;
    background-color: ${(props) => props.theme.darkerBg};
    box-shadow: 0 0 8px ${(props) => props.theme.darkerBg};
    border-radius: 8px;

    & > div {
        padding: 12px;
        font-weight: 400;
        cursor: pointer;

        &.active,
        &:hover {
            background-color: ${(props) => props.theme.darkBg};
        }
    }

    & > div:not(:last-child) {
        border-bottom: 1px solid ${(props) => props.theme.darkBg};
    }
`;

export interface LocationInputProps {
    googleApiKey: string;
    name: string;
    label: string;
    onSuccess: (location: DateLocationPayload) => void;
    onError: () => void;
    initialValue?: string;
    className?: string;
    placeholder?: string;
    error?: string;
    iconColor?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const LocationInput: React.FC<LocationInputProps> = (props: LocationInputProps) => {
    const dispatch = useDispatch();
    const [t] = useTranslation('errors');

    const onLocationChange = (result: any) => {
        geocodeByAddress(result.description)
            .then((geocodeResult) => {
                getLatLng(geocodeResult[0])
                    .then(({ lat, lng }) => {
                        props.onSuccess({ label: geocodeResult[0].formatted_address, lat, lon: lng });
                    })
                    .catch(() => {
                        dispatch(PushNotification(t('google_api_error'), 'error'));
                        props.onError();
                    });
            })
            .catch(() => {
                dispatch(PushNotification(t('google_api_error'), 'error'));
                props.onError();
            });
    };

    return (
        <LocationInputContainer>
            <GooglePlacesAutocomplete
                apiKey={props.googleApiKey}
                debounce={500}
                initialValue={props.initialValue}
                placeholder={props.placeholder}
                renderInput={(locationProps) => {
                    return (
                        <TextInput
                            icon={'pin'}
                            iconColor={props.iconColor}
                            type={'search'}
                            name={props.name}
                            label={props.label}
                            error={props.error}
                            className={props.className}
                            onFocus={props.onFocus}
                            onBlur={props.onBlur}
                            {...locationProps}
                        />
                    );
                }}
                renderSuggestions={(
                    activeSuggestion: number,
                    suggestions: Array<any>,
                    onSelectSuggestion: (selection: any, event: any) => void,
                ) => (
                    <Suggestions
                        activeSuggestion={activeSuggestion}
                        suggestions={suggestions}
                        onSelectSuggestion={onSelectSuggestion}
                    />
                )}
                onSelect={onLocationChange}
            />
        </LocationInputContainer>
    );
};
