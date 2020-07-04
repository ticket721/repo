import React, { ChangeEvent } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { TextInput } from '@frontend/flib-react/lib/components';
import styled from 'styled-components';

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

const SuggestionContainer = styled.div`
    position: relative;
    top: -8px;
    left: ${(props) => props.theme.biggerSpacing};
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
    onSelect: (selection: any) => void;
    initialValue?: string;
    className?: string;
    placeholder?: string;
    error?: string;
    onFocus?: (
        eventOrPath: string | ChangeEvent<any>,
    ) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
}

export const LocationInput: React.FC<LocationInputProps> = (props: LocationInputProps) => (
    <GooglePlacesAutocomplete
        apiKey={props.googleApiKey}
        debounce={500}
        initialValue={props.initialValue}
        placeholder={props.placeholder}
        renderInput={(locationProps) => (
            <TextInput
                icon={'pin'}
                type={'search'}
                name={props.name}
                label={props.label}
                className={props.className}
                error={props.error}
                onFocus={props.onFocus}
                {...locationProps}
            />
        )}
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
        onSelect={props.onSelect}
    />
);
